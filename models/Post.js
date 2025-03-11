const mongoose = require("mongoose");

const PostsSchema = new mongoose.Schema(
  {
    nickname: String,
    title: String,
    content: String,
    cate: String,
    img: String,
    like: Number,
    comments: [{ content: String, nickname: String }],
  },
  { collection: "posts" } // 컬렉션 이름 강제 지정
);

// 커뮤니티 포스트
const Post = mongoose.model("Post", PostsSchema);

// Post 모델 외부 내보내기
module.exports = Post;
