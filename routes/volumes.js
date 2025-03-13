// routes/chart.js
const express = require("express");
const router = express.Router();
const yahooFinance = require("yahoo-finance2").default;

router.get("/:stock_code", async (req, res) => {
  const { stock_code } = req.params;

  if (!stock_code) {
    return res.status(400).json({ message: "주식 코드를 입력하세요." });
  }

  try {
    const stockCodeWithKS = stock_code + ".KS";

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 9); // 7 days ago (adjust as needed)
    const period1 = startDate.toISOString().split("T")[0];

    const chartResult = await yahooFinance.chart(stockCodeWithKS, {
      period1: period1,
      interval: "1d", // Or your preferred interval
    });

    if (!chartResult || !chartResult.quotes) {
      return res
        .status(404)
        .json({ message: "차트 데이터를 찾을 수 없습니다." });
    }

    // Sort quotes in *descending* order by date (most recent first)
    const sortedQuotes = chartResult.quotes.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const chartData = sortedQuotes
      .map((item) => {
        if (!item.date || item.close === null || item.volume === null) {
          return null;
        }

        const date = new Date(item.date);
        date.setUTCHours(date.getUTCHours() + 9);

        return {
          날짜: date.toISOString().split("T")[0],
          시간: date.toISOString().split("T")[1].substring(0, 8),
          종가: item.close,
          거래량: item.volume,
        };
      })
      .filter((item) => item !== null);

    res.json({ chartData });
  } catch (error) {
    console.error("Error fetching data:", error);
    if (error.response) {
      res
        .status(error.response.status)
        .json({ message: `Yahoo Finance API error: ${error.response.status}` });
    } else if (error.name === "BadRequestError") {
      res
        .status(400)
        .json({ message: `Yahoo Finance API error: ${error.message}` });
    } else {
      res.status(500).json({ message: "서버 내부 오류" });
    }
  }
});

module.exports = router;
