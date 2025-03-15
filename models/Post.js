const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    anonymous: { type: Boolean, required: true },
    tag: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, default: null },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // 좋아요 누른 유저 ID 배열
    comments: [CommentSchema], // 댓글을 서브 문서로 저장
  },
  { collection: "posts", timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
