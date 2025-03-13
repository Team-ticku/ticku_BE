// routes/dividend.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
// const { Company } = require("../models/Company"); // 더 이상 Company 모델 필요 없음
require("dotenv").config();

router.get("/:corp_code", async (req, res) => {
  // corp_code를 경로 파라미터로 받음
  const { corp_code } = req.params; // corp_code를 가져옴

  if (!corp_code) {
    return res.status(400).json({ message: "회사 코드를 입력하세요." });
  }

  const apiKey = process.env.DART_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: "DART_API_KEY is not configured." });
  }

  try {
    // Company 모델을 사용하지 않고 바로 corp_code를 사용

    const currentYear = new Date().getFullYear();
    const yearsToFetch = 4;
    const startYear = currentYear - yearsToFetch;
    const dividendInfo = [];

    for (let year = startYear; year <= currentYear - 1; year++) {
      const listUrl = "https://opendart.fss.or.kr/api/alotMatter.json";
      const params = {
        crtfc_key: apiKey,
        corp_code: corp_code, // 직접 corp_code 사용
        bsns_year: year.toString(),
        reprt_code: "11011",
      };

      try {
        const response = await axios.get(listUrl, { params });

        if (response.data.status === "000") {
          const dividendData = response.data.list;

          let commonStockDividend = null;
          let commonStockYield = null;

          if (dividendData) {
            for (const item of dividendData) {
              if (
                item.se === "주당 현금배당금(원)" &&
                item.stock_knd === "보통주"
              ) {
                commonStockDividend = parseFloat(item.thstrm.replace(/,/g, ""));
              } else if (
                item.se === "현금배당수익률(%)" &&
                item.stock_knd === "보통주"
              ) {
                commonStockYield = parseFloat(item.thstrm.replace(/,/g, ""));
              }
            }
          }

          dividendInfo.push({
            year: year,
            commonStockDividend,
            commonStockYield,
          });
        } else if (response.data.status === "013") {
          dividendInfo.push({
            year: year,
            commonStockDividend: null,
            commonStockYield: null,
          });
        } else {
          console.error(
            `OpenDART Error for year ${year}:`,
            response.data.message
          );
          dividendInfo.push({
            // 오류 발생 시에도 null 값 추가
            year: year,
            commonStockDividend: null,
            commonStockYield: null,
          });
        }
      } catch (innerError) {
        console.error(`Error fetching data for year ${year}:`, innerError);
        dividendInfo.push({
          // 내부 에러 발생 시에도 null 값 추가
          year: year,
          commonStockDividend: null,
          commonStockYield: null,
        });
      }
    }

    dividendInfo.sort((a, b) => b.year - a.year);

    res.json(dividendInfo);
  } catch (error) {
    console.error("Error fetching dividend info:", error);
    if (error.response) {
      res
        .status(error.response.status)
        .json({ message: `OpenDART API error: ${error.response.status}` });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
});

module.exports = router;
