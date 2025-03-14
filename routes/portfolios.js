const express = require("express");
const router = express.Router();
const Portfolio = require("../models/Portfolio");

router.post("/", async (req, res) => {
  try {
    const { name, tickers, userId } = req.body;

    const isPinned = false;
    const newPortfolio = new Portfolio({ name, isPinned, tickers, userId });
    await newPortfolio.save(); //도큐먼트 저장!
    res.status(201).json(newPortfolio);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/main-portfolio", async (req, res) => {
  const userId = req.query.userId;

  try {
    const pinnedPortfolio = await Portfolio.findOne({
      userId: userId,
      isPinned: true,
    });

    res.status(200).json(pinnedPortfolio);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
