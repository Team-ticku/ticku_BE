// routes/quarterlySales.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

const apiKey = process.env.DART_API_KEY;

function parseAmount(amountStr) {
  if (!amountStr) return 0;
  const amount = parseInt(amountStr.replace(/,/g, ""), 10);
  return isNaN(amount) ? 0 : Math.round(amount / 100000000); // 억 단위, NaN 처리
}

router.get("/:corpCode", async (req, res) => {
  const { corpCode } = req.params;

  if (!corpCode) {
    return res.status(400).json({ message: "corpCode를 입력하세요." });
  }
  if (!apiKey) {
    return res.status(500).json({ message: "DART_API_KEY is not configured" });
  }

  try {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 1; // 최근 2개년 데이터 (8분기)

    const reports = [];

    for (let year = startYear; year <= currentYear; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        const reportCode = `1101${quarter}`; // 분기 코드 (1분기: 11011, 2분기: 11012, ...)

        const financeUrl = "https://opendart.fss.or.kr/api/fnlttSinglAcnt.json";
        const financeParams = {
          crtfc_key: apiKey,
          corp_code: corpCode,
          bsns_year: year,
          reprt_code: reportCode, // 분기 코드 사용
          fs_div: "CFS",
        };

        try {
          //각 분기별 요청에 대한 에러 핸들링
          const financeResponse = await axios.get(financeUrl, {
            params: financeParams,
          });

          if (financeResponse.data.status !== "000") {
            // 사업보고서가 아닌 데이터는 가져오지 않음
            if (financeResponse.data.status === "013") continue;
            console.error(
              `OpenDART Error (finance) - ${year} Q${quarter}:`,
              financeResponse.data.message
            );
            continue; // 다음 분기/연도로 넘어감
          }

          const financials = financeResponse.data.list;

          // 재무 데이터 필터링 및 가공
          const cfsData = financials.filter((item) => item.fs_div === "CFS");
          const data = {};

          cfsData.forEach((item) => {
            if (item.account_nm.includes("매출액")) {
              data["매출액"] = parseAmount(item.thstrm_amount);
            } else if (item.account_nm.includes("영업이익")) {
              data["영업이익"] = parseAmount(item.thstrm_amount);
            } else if (item.account_nm.includes("당기순이익")) {
              data["당기순이익"] = parseAmount(item.thstrm_amount);
            }
          });
          // 결과에 빈 객체가 들어가지 않도록 처리
          if (Object.keys(data).length > 0) {
            reports.push({
              // year와 quarter를 합쳐서 quarter 속성에 저장
              quarter: `${year}Q${quarter}`, // 이 부분이 변경되었습니다.
              data,
            });
          }
        } catch (error) {
          // HTTP 요청 에러 로깅 (404 에러 등)
          if (error.response && error.response.status === 404) {
            continue;
          }
          console.error(
            `Error fetching quarterly data for ${year} Q${quarter}:`,
            error
          );
          continue; // 다음 분기/연도
        }
      }
    }

    // 연도 및 분기별로 정렬 (최신순) - quarter 속성을 기준으로 정렬
    reports.sort((a, b) => {
      return b.quarter.localeCompare(a.quarter); // 문자열 비교
    });

    res.json(reports);
  } catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
