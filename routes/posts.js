const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// 커뮤니티 게시글 조회
router.get("/", async (req, res) => {
  try {
    //users 콜렉션의 모든 도큐먼트 리스트를 가져온다.
    const posts = await Post.find();
    console.log(posts);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 커뮤니티 게시글 단건 조회
router.get("/:id", async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);
    if (!posts) {
      return res.status(404).json({ message: "Post Not Found" });
    }
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 라우터를 외부로 보냄
module.exports = router;
