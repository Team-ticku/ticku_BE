const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("../models/User");
const Favorites = require("../models/Favorites");
const ScrapNews = require("../models/ScrapNews");
const Portfolio = require("../models/Portfolio");

// 사용자 정의 스토리지 엔진 생성
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "public/img/"; // 업로드 폴더 경로

    // 폴더가 없으면 폴더를 생성
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    cb(null, uploadPath); // 업로드 경로 전달
  },

  // 저장할 파일 이름 지정
  filename: (req, file, cb) => {
    // 변경된 파일 이름을 전달
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// 파일 확장자 필터 정의
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [".jpg", ".jpeg", ".png"];

  // 파일의 확장자와 허용된 확장자를 비교
  if (allowedFileTypes.includes(path.extname(file.originalname))) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

// Multer 설정: 사용자 정의 스토리지를 설정하고 파일 크기 제한 및 파일 필터링 적용
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB 크기 제한
  fileFilter: fileFilter,
});

router.use(express.urlencoded({ extended: true })); // form-data 파싱 가능
router.use(express.static("public")); // 정적 파일 제공

// 사용자 정보 불러오기
router.get("/info/:userId", async (req, res) => {
  // authenticateToken 미들웨어 제거

  const { userId } = req.params;

  // userId가 ObjectId 형식인지 확인
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "잘못된 사용자 ID 형식입니다." });
  }

  try {
    const user = await User.findById(userId); // userId를 사용하여 사용자 정보 조회
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }
    res.json(user);
  } catch (err) {
    console.error("사용자 정보 조회 오류 : ", err);
    return res.status(500).json({ message: "서버 오류" });
  }
});

// 사용자 수정
router.put("/profile-change", upload.single("image"), async (req, res) => {
  const { userId, name } = req.body;
  const imagePath = req.file ? `/img/${req.file.filename}` : null;
  console.log("imagePath : " + imagePath);

  try {
    const updateData = { name };
    if (imagePath) {
      updateData.image = imagePath;
    }

    const updateUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updateUser) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.json(updateUser);
  } catch (err) {
    return res.status(500).json({ message: "서버 오류", err });
  }
});

// 스크랩한 뉴스 가져오기
router.get("/scrapnews", async (req, res) => {
  // 미들웨어 제거
  const userId = req.query.userId;
  // userId가 ObjectId 형식인지 확인
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "잘못된 사용자 ID 형식입니다." });
  }

  // *** 주의: 여기서는 userId를 신뢰합니다.  실제 서비스에서는 이렇게 하면 안 됩니다. ***
  // if (req.user.id !== userId) { // 이 부분을 제거하거나 주석 처리
  //   return res.status(403).json({ message: '권한이 없습니다.' });
  // }

  try {
    const newsList = await ScrapNews.find({ userId: userId });
    res.json(newsList);
  } catch (err) {
    res.status(500).json({ message: err.message }); // 수정된 부분
  }
});

// 관심 기업 가져오기
router.get("/favorites", async (req, res) => {
  const userId = req.query.userId;

  try {
    const favComList = await Favorites.find({ userId: userId });

    res.json(favComList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 내 포트폴리오 가져오기
router.get("/myportfolio", async (req, res) => {
  const userId = req.query.userId;

  try {
    const portfolioList = await Portfolio.find({ userId: userId });
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

  // userId가 ObjectId 형식인지 확인
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "잘못된 사용자 ID 형식입니다." });
  }

  // pubDate를 Date 객체로 변환
  const receivedDate = new Date(pubDate);
  if (isNaN(receivedDate.getTime())) {
    return res.status(400).json({ message: "잘못된 날짜 형식입니다." });
  }

  // *** 주의: 여기서는 userId를 신뢰합니다.  실제 서비스에서는 이렇게 하면 안 됩니다. ***
  // if (req.user.id !== userId) { // 이 부분을 제거하거나 주석 처리
  //   return res.status(403).json({ message: '권한이 없습니다.' });
  // }

  if (!userId || !title || !link || !pubDate || !sourceName) {
    return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
  }

  try {
    if (isMarked) {
      // 스크랩 (DB에 추가)
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
      // 스크랩 취소 (DB에서 제거)
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

// 라우터를 외부로 보냄
module.exports = router;
