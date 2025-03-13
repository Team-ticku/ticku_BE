const mongoose = require("mongoose");

const CalensSchema = new mongoose.Schema(
  {
    date: String,
    company: String,
  },
  { collection: "calens" } // 컬렉션 이름 강제 지정
);

// 배당락일 캘린더
const Calen = mongoose.model("Calen", CalensSchema);

// Calen 모델 외부 내보내기
module.exports = Calen;
