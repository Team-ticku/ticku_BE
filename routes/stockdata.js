const express = require("express");
const router = express.Router();
const yahooFinance = require("yahoo-finance2").default;

router.get("/:stockCode", async (req, res) => {
  try {
    const stockCode = req.params.stockCode;

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

    // UTC -> KST 변환 및 null 값 없는 데이터 필터링 함수
    const processQuoteData = (quotes) =>
      quotes
        .map((q) => ({
          ...q,
          date: new Date(
            new Date(q.date).setHours(new Date(q.date).getHours() + 9)
          ),
        }))
        .filter((q) => q.close !== null); // close 값이 null이 아닌 데이터만 필터

    const allData = processQuoteData(chartResult.quotes); // 모든 quote 데이터 처리 (null 제거)

    // todayPrice 찾기 (가장 최근 데이터)
    if (allData.length > 0) {
      todayPrice = allData[allData.length - 1].close;
    }

    // yesterdayClose 찾기 (todayPrice 바로 전 데이터)
    if (todayPrice !== null && allData.length > 1) {
      yesterdayClose = allData[allData.length - 2].close; //마지막 전 close값
    }
    // yesterdayClose가 null이면, yesterdayData를 검색
    if (yesterdayClose === null) {
      // 어제 날짜 구하기 (한국 시간 기준)
      const today = new Date();
      today.setHours(today.getHours() + 9); // 한국 시간
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split("T")[0];

      const yesterdayData = allData.filter(
        (q) => q.date.toISOString().split("T")[0] === yesterdayString
      );
      if (yesterdayData.length > 0) {
        yesterdayClose = yesterdayData[yesterdayData.length - 1].close;
      }
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
