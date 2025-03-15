const express = require("express");
const router = express.Router();

const Favorites = require("../models/Favorites");

router.get("/status", async (req, res) => {
  const userId = req.query.userId;
  const name = req.query.name;

  try {
    const starData = await Favorites.findOne({ userId: userId, name: name });

    if (starData) {
      res.json({ isFavorite: true });
    } else {
      res.json({ isFavorite: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/add", async (req, res) => {
  const { name, userId } = req.body;
  console.log(name);
  console.log(userId);

  try {
    const existingFavorite = await Favorites.findOne({
      name: name,
      userId: userId,
    });
    if (existingFavorite) {
      return res.status(400).json({ message: "이미 저장된 기업입니다." });
    }

    const newFavorite = new Favorites({
      name: name,
      isFavorite: true,
      userId: userId,
    });
    await newFavorite.save();
    res.status(200).json({ message: "기업을 저장하였습니다." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/remove", async (req, res) => {
  const { name, userId } = req.body;
  console.log(name);
  console.log(userId);

  try {
    const result = await Favorites.findOneAndDelete({
      name: name,
      userId: userId,
    });
    if (!result) {
      return res.status(404).json({ message: "해당 기업을 찾을 수 없습니다." });
    }
    res.status(200).json({ message: "기업이 삭제되었습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// 라우터를 외부로 보냄
module.exports = router;
