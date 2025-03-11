const express = require("express");
const router = express.Router();
const User = require("../models/User");

// 계정 목록 조회
router.get("/", async (req, res) => {
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
});

// 라우터를 외부로 보냄
module.exports = router;
