const express = require("express");
const router = express.Router();
const { Company } = require("../models/Company");

// 검색 API 구현
router.get("/", async (req, res) => {
  const { query } = req.query; // 클라이언트에서 보낸 검색어

  if (!query) {
    return res.status(400).json({ message: "검색어를 입력하세요." });
  }

  try {
    const companies = await Company.find({
      corp_name: { $regex: query, $options: "i" }, // *** 수정: 템플릿 리터럴 제거
    }).limit(5);

    if (companies.length === 0) {
      return res.status(404).json({ message: "검색 결과가 없습니다." });
    }

    const searchResults = companies.map((company) => ({
      id: company._id, // *** _id를 사용 (Mongoose 기본값)
      corp_name: company.corp_name,
      stock_code: company.stock_code,
      corp_code: company.corp_code,
    }));

    res.json(searchResults); // *** 수정: searchResults를 응답
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;
