const express = require("express");
const router = express.Router();
const yahooFinance = require("yahoo-finance2").default;

router.get("/:stockCode", async (req, res) => {
  try {
    const stockCode = req.params.stockCode;

    // 어제 날짜 구하기 (한국 시간 기준)
    const today = new Date();
    today.setHours(today.getHours() + 9); // 한국 시간
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split("T")[0];

    const chartResult = await yahooFinance.chart(`${stockCode}.KS`, {
      period1: "2024-01-01", // 적절하게 수정
    });

    if (!chartResult || !chartResult.quotes) {
      return res
        .status(404)
        .json({ message: "주가 데이터를 찾을 수 없습니다." });
    }

    let todayPrice = null;
    let yesterdayClose = null;

    const todayData = chartResult.quotes
      .map((q) => ({
        ...q,
        date: new Date(
          new Date(q.date).setHours(new Date(q.date).getHours() + 9)
        ),
      })) // UTC -> KST
      .filter(
        (q) =>
          q.date.toISOString().split("T")[0] ===
            today.toISOString().split("T")[0] && q.open !== null
      );

    const yesterdayData = chartResult.quotes
      .map((q) => ({
        ...q,
        date: new Date(
          new Date(q.date).setHours(new Date(q.date).getHours() + 9)
        ),
      })) // UTC -> KST
      .filter(
        (q) =>
          q.date.toISOString().split("T")[0] === yesterdayString &&
          q.open !== null
      );

    if (todayData.length > 0) {
      todayPrice = todayData[todayData.length - 1].close;
    } else {
      yesterdayClose =
        yesterdayData.length > 0
          ? yesterdayData[yesterdayData.length - 1].close
          : null;
      todayPrice = yesterdayClose;
    }

    if (yesterdayData.length > 0 && !yesterdayClose) {
      yesterdayClose = yesterdayData[yesterdayData.length - 1].close;
    }

    let change = null;
    if (todayPrice !== null && yesterdayClose !== null) {
      change = todayPrice - yesterdayClose;
    }

    res.json({
      price: todayPrice !== null ? todayPrice.toFixed(0) : null,
      change: change !== null ? change.toFixed(0) : null,
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;
