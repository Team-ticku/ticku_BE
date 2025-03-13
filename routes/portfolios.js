const express = require("express");
const router = express.Router();
const Portfolio = require("../models/Portfolio");

router.post("/", async (req, res) => {
  try {
    const { name, tickers, userId } = req.body;
    console.log("name : " + name);
    console.log("tickers : " + tickers);

    const isPinned = false;
    const newPortfolio = new Portfolio({ name, isPinned, tickers, userId });
    //새 도큐먼트 객체 만들기    const newPort = new Port({ company, percent }); // Port 모델 사용
    await newPortfolio.save(); //도큐먼트 저장!
    res.status(201).json(newPortfolio);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
