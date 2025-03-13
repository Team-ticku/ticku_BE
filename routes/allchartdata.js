// routes/allchartdata.js (서버 - 수정)
const express = require("express");
const router = express.Router();
const yahooFinance = require("yahoo-finance2").default;

router.get("/:stockCode", async (req, res) => {
  try {
    const { stockCode } = req.params;
    const { period, interval } = req.query; // period, interval 모두 받음

    const today = new Date();
    today.setHours(today.getHours() + 9);
    let startDate = new Date(today);

    switch (period) {
      case "1w":
        startDate.setDate(startDate.getDate() - 6);
        break;
      case "3m":
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "1y":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 6);
    }
    startDate.setHours(0, 0, 0, 0);

    // yahooFinance.chart 호출 시 interval 사용
    const chartResult = await yahooFinance.chart(`${stockCode}.KS`, {
      period1: startDate.toISOString().split("T")[0],
      interval: interval, // 클라이언트에서 전달받은 interval 사용
    });

    if (
      !chartResult ||
      !chartResult.quotes ||
      chartResult.quotes.length === 0
    ) {
      throw new Error("주가 데이터를 찾을 수 없습니다.");
    }

    res.json(chartResult.quotes);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;
