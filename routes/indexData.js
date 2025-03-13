const express = require("express");
const yahooFinance = require("yahoo-finance2").default;
const IndexData = require("../models/IndexData"); // MongoDB 모델 불러오기
const router = express.Router();

// 날짜를 YYYY-MM-DD 형식으로 변환
const formatDateToString = (date) => {
  return date.toISOString().split("T")[0];
};

// KOSPI & KOSDAQ 데이터 저장 및 응답
router.get("/", async (req, res) => {
  try {
    console.log("📢 Yahoo Finance에서 KOSPI, KOSDAQ 데이터 가져오는 중...");

    // 3개월 전 날짜 설정
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    const formattedStartDate = formatDateToString(startDate);

    // 오늘 날짜 설정
    const endDate = new Date();
    const formattedEndDate = formatDateToString(endDate);

    // 과거 데이터 가져오기
    const kospiHistory = await yahooFinance.historical("^KS11", {
      period1: formattedStartDate,
      period2: formattedEndDate,
      interval: "1d",
    });

    const kosdaqHistory = await yahooFinance.historical("^KQ11", {
      period1: formattedStartDate,
      period2: formattedEndDate,
      interval: "1d",
    });

    if (!kospiHistory || !kosdaqHistory) {
      return res
        .status(500)
        .json({ message: "과거 데이터를 가져오는 중 오류 발생" });
    }

    // 필요한 데이터만 필터링 (date, close)
    const filteredKospiHistory = kospiHistory.map((item) => ({
      date: formatDateToString(new Date(item.date)),
      close: item.close,
    }));

    const filteredKosdaqHistory = kosdaqHistory.map((item) => ({
      date: formatDateToString(new Date(item.date)),
      close: item.close,
    }));

    console.log("필터링된 KOSPI 데이터:", filteredKospiHistory);
    console.log("필터링된 KOSDAQ 데이터:", filteredKosdaqHistory);

    //  기존 데이터 삭제 후 새 데이터 저장
    await IndexData.deleteMany({ indexName: { $in: ["KOSPI", "KOSDAQ"] } });

    const kospiDoc = new IndexData({
      symbol: "KOSPI",
      value: filteredKospiHistory,
    });

    const kosdaqDoc = new IndexData({
      symbol: "KOSDAQ",
      value: filteredKosdaqHistory,
    });

    await kospiDoc.save();
    await kosdaqDoc.save();

    console.log("KOSPI, KOSDAQ 데이터 저장 완료!");

    // 클라이언트로 응답
    res.json({
      message: "KOSPI, KOSDAQ 데이터 저장 및 전송 완료",
      kospi: filteredKospiHistory,
      kosdaq: filteredKosdaqHistory,
    });
  } catch (error) {
    console.error("서버 내부 오류 발생:", error);
    res.status(500).json({ message: "서버 내부 오류 발생" });
  }
});

module.exports = router;
