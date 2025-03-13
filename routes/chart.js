// routes/chart.js (이전 답변에서 수정한 코드, 확인만)
const yahooFinance = require("yahoo-finance2").default;
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const { stockCode } = req.query;

  if (!stockCode) {
    return res.status(400).json({ message: "주식 코드를 입력하세요." });
  }

  const stockCodeKS = stockCode + ".KS";

  try {
    const quoteData = await yahooFinance.quote(stockCodeKS);

    if (!quoteData) {
      return res
        .status(404)
        .json({ message: "주가 데이터를 찾을 수 없습니다." });
    }

    const currentPriceData = {
      날짜: new Date(quoteData.regularMarketTime * 1000)
        .toISOString()
        .split("T")[0],
      시간: new Date(quoteData.regularMarketTime * 1000)
        .toISOString()
        .split("T")[1]
        .substring(0, 8),
      시가: quoteData.regularMarketOpen,
      고가: quoteData.regularMarketDayHigh,
      저가: quoteData.regularMarketDayLow,
      종가: quoteData.regularMarketPrice,
      거래량: quoteData.regularMarketVolume,
    };

    res.json(currentPriceData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res
      .status(500)
      .json({ message: "Error fetching data", error: error.message });
  }
});

module.exports = router;
