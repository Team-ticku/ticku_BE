const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // 디렉토리 확인 및 생성
const router = express.Router();
const mongoose = require("mongoose"); // mongoose 불러오기
const Post = require("../models/Post");
const User = require("../models/User"); // 유저 정보 조회 위해 추가

// public/postImages 디렉토리 확인 후 없으면 생성
const uploadDir = path.join(__dirname, "../public/postImages");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multer 설정 (파일 저장 위치 및 파일명 설정)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 최대 파일 크기 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("이미지 파일만 업로드 가능합니다."), false);
    }
  },
});

// 모든 게시글 가져오기
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("likes", "name")
      .populate("userId", "name")
      .populate("comments.userId", "name") // 댓글 작성자 정보도 불러오기
      .exec();

    const postsWithUserName = posts.map((post) => {
      const userName = post.anonymous
        ? "익명"
        : post.userId?.name || "알 수 없음";
      return { ...post.toObject(), name: userName };
    });

    res.json(postsWithUserName);
  } catch (err) {
    res.status(500).json({ error: "게시글을 불러오는 데 실패했습니다." });
  }
});

// 특정 게시글 가져오기

router.get("/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId)
      .populate("likes", "name")
      .populate("userId", "name")
      .populate("comments.userId", "name")
      .exec();

    if (!post) {
      return res.status(404).json({ error: "해당 게시글을 찾을 수 없습니다." });
    }

    const userName = post.anonymous
      ? "익명"
      : post.userId?.name || "알 수 없음";
    res.json({ ...post.toObject(), name: userName });
  } catch (err) {
    res.status(500).json({ error: "게시글을 불러오는 데 실패했습니다." });
  }
});

// 게시글 작성하기 (이미지 업로드 처리 포함)
router.post("/", upload.single("image"), async (req, res) => {
  const { userId, tag, title, content, anonymous } = req.body;
  const image = req.file ? `/postImages/${req.file.filename}` : null;

  if (!userId || !tag || !title || !content || anonymous === undefined) {
    return res.status(400).json({ error: "모든 필드를 채워주세요." });
  }

  try {
    const user = await User.findById(userId);
    const name = anonymous ? "익명" : user?.name || "알 수 없음";

    const newPost = new Post({
      userId,
      tag,
      title,
      content,
      name,
      anonymous,
      image,
    });
    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "게시글 작성에 실패했습니다." });
  }
});

router.post("/:postId/comments", async (req, res) => {
  const { postId } = req.params;
  const { userId, content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "댓글 내용을 입력해주세요." });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "해당 게시글을 찾을 수 없습니다." });
    }

    const user = await User.findById(userId);
    const userName = user?.name || "알 수 없음";

    post.comments.push({ userId, name: userName, content });
    await post.save();
    res.json(post);
  } catch (err) {
    console.error("댓글 추가 오류:", err); // 오류 로그 추가
    res.status(500).json({ error: "댓글 추가에 실패했습니다." });
  }
});

// 게시글 좋아요/좋아요 취소
router.post("/:postId/likes", async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  if (!postId || !userId) {
    return res
      .status(400)
      .json({ error: "게시글 ID 또는 사용자 ID가 누락되었습니다." });
  }

  try {
    // postId가 유효한 ObjectId인지 확인
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "유효하지 않은 게시글 ID입니다." });
    }

    // 게시글 찾기
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "해당 게시글을 찾을 수 없습니다." });
    }

    // 좋아요 상태 확인 및 처리
    const isLiked = post.likes.some((id) => id.equals(userId));
    if (isLiked) {
      post.likes = post.likes.filter((id) => !id.equals(userId));
    } else {
      post.likes.push(userId);
    }

    // 게시글 저장
    await post.save();
    res.json(post); // 수정된 게시글 반환
  } catch (err) {
    console.error(err); // 서버 로그에 에러 출력
    res.status(500).json({ error: "좋아요 처리 중 오류가 발생했습니다." });
  }
});

module.exports = router;
