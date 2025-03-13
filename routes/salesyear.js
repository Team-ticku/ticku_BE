// routes/salesyear.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

const apiKey = process.env.DART_API_KEY;

function parseAmount(amountStr) {
  if (!amountStr) return 0; // null 또는 undefined 처리
  const amount = parseInt(amountStr.replace(/,/g, ""), 10);
  return isNaN(amount) ? 0 : Math.round(amount / 100000000); // 억 단위, NaN 처리
}

router.get("/:corpCode", async (req, res) => {
  const { corpCode } = req.params;
  const currentYear = new Date().getFullYear(); // 현재 연도 가져오기

  if (!corpCode) {
    return res.status(400).json({ message: "corpCode를 입력하세요." });
  }
  if (!apiKey) {
    return res.status(500).json({ message: "DART_API_KEY is not configured" });
  }

  try {
    const yearsToFetch = 5;
    const startYear = currentYear - (yearsToFetch - 1);

    const listUrl = "https://opendart.fss.or.kr/api/list.json";
    const listParams = {
      crtfc_key: apiKey,
      corp_code: corpCode,
      bgn_de: `${startYear}0101`,
      end_de: `${currentYear}1231`, // 현재 연도까지
      pblntf_ty: "A",
      page_no: 1,
      page_count: 100,
    };

    const listResponse = await axios.get(listUrl, { params: listParams });

    if (listResponse.data.status !== "000") {
      console.error("OpenDART Error (list):", listResponse.data.message);
      return res
        .status(500)
        .json({ message: `OpenDART list error: ${listResponse.data.message}` });
    }

    const recentFilings = listResponse.data.list;
    const reports = [];

    for (const filing of recentFilings) {
      const reportYearMatch = filing.report_nm.match(/\((\d{4})\.\d{2}\)/);
      const reportYear = reportYearMatch ? reportYearMatch[1] : null;
      // 현재 연도부터 과거 yearsToFetch년 동안의 사업보고서만, 그리고 날짜형식에 맞는지 확인
      if (
        reportYear &&
        parseInt(reportYear) >= startYear &&
        parseInt(reportYear) <= currentYear &&
        filing.report_nm.includes("사업보고서")
      ) {
        const financeUrl = "https://opendart.fss.or.kr/api/fnlttMultiAcnt.json";
        const financeParams = {
          crtfc_key: apiKey,
          corp_code: corpCode,
          rcept_no: filing.rcept_no,
          bsns_year: reportYear,
          reprt_code: "11011", // 사업보고서
          fs_div: "CFS",
        };

        const financeResponse = await axios.get(financeUrl, {
          params: financeParams,
        });

        if (financeResponse.data.status !== "000") {
          console.error(
            `OpenDART Error (finance) - ${filing.report_nm} (${filing.rcept_no}):`,
            financeResponse.data.message
          );
          continue;
        }

        const financials = financeResponse.data.list;
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

        reports.push({
          reportYear,
          data,
        });
      }
    }

    reports.sort((a, b) => b.reportYear - b.reportYear);
    res.json(reports);
  } catch (error) {
    console.error("API Error:", error.message);
    if (error.response) {
      console.error("  Status:", error.response.status);
      console.error("  Data:", error.response.data);
      res.status(error.response.status).json({
        message: `OpenDART API error: ${error.response.status}`,
      });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
});

module.exports = router;
