const express = require("express");
const router = express.Router();

const ScrapNews = require("../models/ScrapNews");

router.get("/state", async (req, res) => {
  const userId = req.query.userId;
  const title = req.query.title;

  try {
    const newsData = await ScrapNews.findOne({ userId: userId, title: title });

    if (newsData) {
      res.json({ isMarked: true });
    } else {
      res.json({ isMarked: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/add", async (req, res) => {
  const { title, link, pubDate, sourceName, isMarked, userId } = req.body;

  try {
    const existingNews = await ScrapNews.findOne({
      title: title,
      userId: userId,
    });
    if (existingNews) {
      return res.status(400).json({ message: "이미 저장된 뉴스입니다." });
    }

    const newNews = new ScrapNews({
      title: title,
      link: link,
      pubDate: pubDate,
      sourceName: sourceName,
      isMarked: isMarked,
      userId: userId,
    });
    await newNews.save();
    res.status(200).json({ message: "뉴스를 저장하였습니다." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/remove", async (req, res) => {
  const { title, userId } = req.body;

  try {
    const result = await ScrapNews.findOneAndDelete({
      title: title,
      userId: userId,
    });
    if (!result) {
      return res.status(404).json({ message: "해당 뉴스를 찾을 수 없습니다." });
    }
    res.status(200).json({ message: "뉴스가 삭제되었습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// 라우터를 외부로 보냄
module.exports = router;
