const express = require("express");
const router = express.Router();

const axios = require("axios");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");

async function fetchStockRanking() {
  const url = "https://finance.naver.com/sise/lastsearch2.naver";

  const response = await axios.get(url, {
    responseType: "arraybuffer", // 배열로 받아오기
  });

  // 서버에서 받은 데이터를 iconv를 이용해 UTF-8로 변환
  const data = iconv.decode(response.data, "euc-kr"); // EUC-KR -> UTF-8로 변환
  const $ = cheerio.load(data); // cheerio로 HTML을 파싱

  const rows = $("table.type_5 tbody tr"); // (클래스 이름 tbody요소 각t행) 선택
  const rankings = [];

  rows.each((index, row) => {
    const columns = $(row).find("td");
    if (columns.length > 1) {
      const rank = $(columns[0]).text().trim(); // 순위
      const name = $(columns[1]).find("a").text().trim(); // 종목명
      const ratio = $(columns[5]).text().trim(); // 검색비율
      const price = $(columns[3]).text().trim(); // 현재가

      rankings.push({ rank, name, ratio, price });
    }
  });

  return rankings;
}
router.get("/", async (req, res) => {
  try {
    console.log("Stock ranking request received..."); // 요청 수신 로그

    const rankings = await fetchStockRanking(); // 종목 순위 크롤링 함수 호출

    console.log("Stock rankings fetched successfully."); // 크롤링 성공 로그
    console.log("Rankings:", rankings); // 가져온 순위 데이터 로그

    res.json(rankings); // 클라이언트에 JSON 형식으로 응답
  } catch (error) {
    console.error("Error occurred while fetching stock rankings:", error); // 에러 발생 시 에러 로그 출력
    res.status(500).send("에러가 발생했습니다!"); // 클라이언트에 에러 응답
  }
});

module.exports = router;
