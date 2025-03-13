const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("../models/User");
const Favorites = require("../models/Favorites");

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

// 즐겨찾기 삭제 (isFavorite가 false일 때)
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

// 계정 목록 조회
/*router.get("/", async (req, res) => {
  try {
    //users 콜렉션의 모든 도큐먼트 리스트를 가져온다.
    const users = await User.find();
    console.log(users);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 계정 단건 조회
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 계정 추가
router.post("/", async (req, res) => {
  try {
    const { userid, userpw, nickname } = req.body;
    //새 도큐먼트 객체 만들기
    const newUser = new User({ userid, userpw, nickname });
    await newUser.save(); //도큐먼트 저장!
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 계정 수정
router.put("/:id", async (req, res) => {
  try {
    const { userid, userpw, nickname } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { userid, userpw, nickname },
      { new: true } //업데이트된 도큐먼트를 리턴한다.
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User Not Found" });
    }
    res.status(201).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 계정 삭제
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});*/

// 라우터를 외부로 보냄
module.exports = router;
