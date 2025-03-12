const express = require("express");
const router = express.Router();
const Calen = require("../models/Calen");

router.get("/", async (req, res) => {
  try {
    //users 콜렉션의 모든 도큐먼트 리스트를 가져온다.
    const calens = await Calen.find();
    console.log(calens);
    res.json(calens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { date, company } = req.body;
    //새 도큐먼트 객체 만들기
    const newCalen = new Calen({ date, company }); // Calen 모델 사용
    await newCalen.save(); //도큐먼트 저장!
    res.status(201).json(newCalen);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
