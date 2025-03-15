const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

const User = require("../models/User");
const Favorites = require("../models/Favorites");
const ScrapNews = require("../models/ScrapNews");
const Portfolio = require("../models/Portfolio");

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary 스토리지 설정
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_images", // 업로드할 폴더
    allowed_formats: ["jpg", "jpeg", "png"], // 허용되는 이미지 포맷
  },
});

// Multer 설정
const upload = multer({ storage });

// 사용자 정보 불러오기
router.get("/info/:userId", async (req, res) => {
  const { userId } = req.params;

  // userId가 ObjectId 형식인지 확인
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "잘못된 사용자 ID 형식입니다." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }
    res.json(user);
  } catch (err) {
    console.error("사용자 정보 조회 오류 : ", err);
    return res.status(500).json({ message: "서버 오류" });
  }
});

// 사용자 수정 (프로필 이미지 포함)
router.put("/profile-change", upload.single("image"), async (req, res) => {
  const { userId, name } = req.body;
  const imageUrl = req.file ? req.file.path : null; // Cloudinary에서 반환된 이미지 URL

  try {
    const updateData = { name };
    if (imageUrl) {
      updateData.image = imageUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.json(updatedUser);
  } catch (err) {
    return res.status(500).json({ message: "서버 오류", err });
  }
});

// 스크랩한 뉴스 가져오기
router.get("/scrapnews", async (req, res) => {
  const userId = req.query.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "잘못된 사용자 ID 형식입니다." });
  }

  try {
    const newsList = await ScrapNews.find({ userId });
    res.json(newsList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 관심 기업 가져오기
router.get("/favorites", async (req, res) => {
  const userId = req.query.userId;

  try {
    const favComList = await Favorites.find({ userId });
    res.json(favComList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 내 포트폴리오 가져오기
router.get("/myportfolio", async (req, res) => {
  const userId = req.query.userId;

  try {
    const portfolioList = await Portfolio.find({ userId });
    res.json(portfolioList);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

// 내 포트폴리오 핀 수정
router.put("/myportfolio-change", async (req, res) => {
  const { id, userId } = req.body;

  try {
    await Portfolio.updateMany({ userId }, { $set: { isPinned: false } });
    await Portfolio.findByIdAndUpdate(id, { isPinned: true });
    res.json({ message: "핀 상태가 업데이트 되었습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/scrapnews", async (req, res) => {
  const { userId, title, link, pubDate, sourceName, isMarked } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "잘못된 사용자 ID 형식입니다." });
  }

  const receivedDate = new Date(pubDate);
  if (isNaN(receivedDate.getTime())) {
    return res.status(400).json({ message: "잘못된 날짜 형식입니다." });
  }

  if (!userId || !title || !link || !pubDate || !sourceName) {
    return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
  }

  try {
    if (isMarked) {
      const existingNews = await ScrapNews.findOne({ userId, link });
      if (existingNews) {
        return res.status(409).json({ message: "이미 스크랩된 뉴스입니다." });
      }

      const newScrapNews = new ScrapNews({
        userId,
        title,
        link,
        pubDate: receivedDate,
        sourceName,
      });
      await newScrapNews.save();
      res
        .status(201)
        .json({ message: "뉴스가 스크랩되었습니다.", news: newScrapNews });
    } else {
      const deletedNews = await ScrapNews.findOneAndDelete({ userId, link });
      if (!deletedNews) {
        return res
          .status(404)
          .json({ message: "스크랩된 뉴스를 찾을 수 없습니다." });
      }
      res.status(200).json({ message: "뉴스 스크랩이 취소되었습니다." });
    }
  } catch (error) {
    console.error("뉴스 스크랩/취소 중 오류:", error);
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
});

module.exports = router;
