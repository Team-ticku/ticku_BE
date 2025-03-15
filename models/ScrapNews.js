const mongoose = require("mongoose");

const ScrapNewsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String, required: true }, // 링크 추가
    pubDate: { type: Date, required: true }, // 발행일 (Date 타입)
    content: String, // 필수는 아님
    hasImage: Boolean, // 필수는 아님
    image: String, // 필수는 아님
    sourceName: { type: String, required: true },
    sourceImage: String, // 필수는 아님
    userId: { type: String, required: true },
  },
  { collection: "scrap_news" }
);

// userId와 link 조합에 대한 unique 제약 조건 (선택 사항)
ScrapNewsSchema.index({ userId: 1, link: 1 }, { unique: true, sparse: true });

const ScrapNews = mongoose.model("ScrapNews", ScrapNewsSchema);
module.exports = ScrapNews;
