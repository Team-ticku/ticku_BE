const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema(
  {
    userid: String,
    userpw: String,
    nickname: String,
  },
  { collection: "users" } // 컬렉션 이름 강제 지정
);

// 계정 DB
const User = mongoose.model("User", UsersSchema);

// User 모델 외부로 내보내기기
module.exports = User;
