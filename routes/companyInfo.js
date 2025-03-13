// routes/companyInfo.js

const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config(); // dotenv 설정 추가

// Open DART API 키 (환경 변수에서 가져오기)
const apiKey = process.env.DART_API_KEY;

router.get("/:corpCode", async (req, res) => {
  const { corpCode } = req.params;

  if (!corpCode) {
    return res.status(400).json({ message: "corpCode를 입력하세요." });
  }

  if (!apiKey) {
    return res.status(500).json({ message: "DART_API_KEY is not configured." });
  }

  const companyInfoUrl = "https://opendart.fss.or.kr/api/company.json";
  const params = {
    crtfc_key: apiKey,
    corp_code: corpCode,
  };

  try {
    const response = await axios.get(companyInfoUrl, { params });

    if (response.data.status !== "000") {
      console.error(`Open DART API 오류: ${response.data.message}`);
      return res.status(404).json({ message: response.data.message }); // OpenDart 오류 메시지 전달
    }

    const companyData = response.data;

    // 설립일 형식 변환 (YYYYMMDD -> YYYY-MM-DD)
    let estDt = companyData.est_dt;
    if (estDt && estDt.length === 8) {
      estDt = `${estDt.substring(0, 4)}-${estDt.substring(
        4,
        6
      )}-${estDt.substring(6, 8)}`;
    } else {
      estDt = null; // 유효하지 않은 날짜 처리
    }

    const extractedData = {
      대표이사: companyData.ceo_nm,
      설립일: estDt,
      종목코드: companyData.stock_code,
      홈페이지: companyData.hm_url,
    };

    res.json(extractedData); // 성공적인 응답
  } catch (error) {
    console.error("Open DART API 요청 오류:", error.message);
    if (error.response) {
      // 서버가 응답을 반환한 경우 (상태 코드가 2xx가 아님)
      res
        .status(error.response.status)
        .json({ message: `Open DART API 오류: ${error.response.status}` });
    } else if (error.request) {
      // 요청은 이루어졌으나 응답을 받지 못한 경우
      res.status(500).json({ message: "Open DART API로부터 응답이 없습니다." });
    } else {
      // 요청을 보내기 전에 발생한 오류
      res.status(500).json({ message: "Open DART API 요청 중 오류 발생" });
    }
  }
});

module.exports = router;
