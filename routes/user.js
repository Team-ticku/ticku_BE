const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("../models/User");
const Favorites = require("../models/Favorites");
const ScrapNews = require("../models/ScrapNews");
const Portfolio = require("../models/Portfolio");
const { error } = require("console");

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
  const { userId } = req.params;

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
  const userId = req.query.userId;

  try {
    const newsList = await ScrapNews.find({ userId: userId });
    //const newsList = await ScrapNews.find();
    res.json(newsList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 스크랩한 뉴스 삭제하기
router.delete("/delete-scrapnews", async (req, res) => {
  const { newsId } = req.body;

  if (!newsId) {
    return res.status(400).json({ message: "삭제할 뉴스 ID가 필요합니다." });
  }

  try {
    const result = await ScrapNews.findByIdAndDelete(newsId);
    if (!result) {
      return res.status(404).json({ message: "해당 뉴스가 없습니다." });
    }
    return res.json({ message: "뉴스가 삭제됐습니다." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 관심 기업 가져오기
router.get("/favorites", async (req, res) => {
  const userId = req.query.userId;

  try {
    const favComList = await Favorites.find({ userId: userId });
    //const favComList = await Favorites.find();

    res.json(favComList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 관심 기업 즐겨찾기 삭제
router.delete("/delete-favorite", async (req, res) => {
  const { companyId } = req.body;

  try {
    // isFavorite가 false일 때 DB에서 삭제
    const result = await Favorites.findByIdAndDelete(companyId);
    if (!result) {
      return res.status(404).json({ message: "회사를 찾을 수 없습니다." });
    }
    return res.status(200).json({ message: "회사가 삭제되었습니다." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "DB에서 삭제하는 데 실패했습니다." });
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
    res.status(500).json({ message: "핀 수정 실패" });
  }
});

// 라우터를 외부로 보냄
module.exports = router;
