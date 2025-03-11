const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// 아이디 중복 확인
router.post("/check-in", async (req, res) => {
  const uid = req.body.uid;

  try {
    const existingUser = await User.findOne({ uid });

    // 아이디가 이미 존재하면 isIdDuplicate를 true로 반환
    if (existingUser) {
      return res.json({ isIdDuplicate: true });
    }
    res.json({ isIdDuplicate: false });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "서버오류" });
  }
});

// 회원 가입
router.post("/join", async (req, res) => {
  const { uid, password, name } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ uid, password: hashedPassword, name });
    await newUser.save();

    res.status(201).send({ message: "회원가입 성공" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "회원가입 오류" });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  const { uid, password } = req.body;

  try {
    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(400).json({ message: "사용자가 존재하지 않습니다." });
    }

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "비밀번호가 틀렸습니다." });
    }

    const token = jwt.sign({ id: user._id, uid: user.uid }, "secretkey", {
      expiresIn: "1h",
    });

    res.json({ message: "로그인 성공", token, userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
