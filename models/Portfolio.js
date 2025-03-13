const mongoose = require("mongoose");

const PortfoliosSchema = new mongoose.Schema(
  {
    name: String,
    isPinned: Boolean,
    tickers: Array,
    userId: String,
  },
  { collection: "portfolios" } // 컬렉션 이름 강제 지정
);

// 포트폴리오
const Portfolio = mongoose.model("Portfolio", PortfoliosSchema);

// Portfolio 모델 외부 내보내기
module.exports = Portfolio;
