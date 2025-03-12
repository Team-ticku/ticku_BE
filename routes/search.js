const express = require("express");
const router = express.Router();
const { Company } = require("../models/Company");

// 검색 API 구현하기
router.get("/", async (req, res) => {
  const { query } = req.query; // 클라이언트에서 보낸 검색어

  console.log("검색 요청 수신:", query); // 추가
  if (!query) {
    return res.status(400).json({ message: "검색어를 입력하세요." });
  }

  try {
    const companies = await Company.find({
      corp_name: { $regex: `${query}`, $options: "i" },
    }).limit(5);

    if (companies.length === 0) {
      return res.status(404).json({ message: "검색 결과가 없습니다." });
    }

    res.json(companies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;
