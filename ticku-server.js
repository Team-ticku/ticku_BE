const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Atlas 연결 (async/await 사용)
(async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    console.log("MongoDB Connection String:", MONGO_URI); // 연결 문자열 확인
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    // 라우트 모듈 가져오기 (mongoose 연결 성공 후)
    const authRouter = require("./routes/auth");
    const usersRouter = require("./routes/users");
    const postsRouter = require("./routes/posts");

    // 라우트 등록
    app.use("/auth", authRouter);
    app.use("/users", usersRouter);
    app.use("/posts", postsRouter);

    //서버 실행
    app.listen(PORT, () => {
      console.log(`블로그 REST API 서버(${PORT}) 실행중...`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
})();

// 전역 오류 처리
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception thrown:", err);
  process.exit(1); // 종료 (프로세스 매니저가 재시작)
});
