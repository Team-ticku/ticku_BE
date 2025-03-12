const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    uid: String,
    password: String,
    name: String,
    image: String,
  },
  { collection: "users" }
);

// 계정 DB
const User = mongoose.model("User", UserSchema);

// User 모델 외부로 내보내기기
module.exports = User;
