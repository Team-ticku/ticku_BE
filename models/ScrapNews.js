const mongoose = require("mongoose");

const ScrapNewsSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    hasImage: Boolean,
    image: String,
    sourceName: String,
    sourceImage: String,
    defaultBookmarked: Boolean,
    userId: String,
  },
  { collection: "scrap_news" }
);

// 계정 DB
const ScrapNews = mongoose.model("ScrapNews", ScrapNewsSchema);

// User 모델 외부로 내보내기기
module.exports = ScrapNews;
