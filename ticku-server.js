const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const path = require("path");
app.use("/img", express.static(path.join(__dirname, "public/img")));

// MongoDB Atlas 연결 (async/await 사용)
(async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    console.log("MongoDB Connection String:", MONGO_URI); // 연결 문자열 확인
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    // 라우트 모듈 가져오기 (mongoose 연결 성공 후)
    const authRouter = require("./routes/auth");
    const usersRouter = require("./routes/user");
    const postsRouter = require("./routes/posts");
    const explainsRouter = require("./routes/explains");
    const calensRouter = require("./routes/calens");
    const searchRouter = require("./routes/search");
    const stockDataRouter = require("./routes/stockdata");
    const allChartRouter = require("./routes/allchartdata");
    const portfoliosRouter = require("./routes/portfolios");
    const companyInfoRouter = require("./routes/companyInfo");
    const yearResultRouter = require("./routes/yearResult");
    const volumeRouter = require("./routes/volumes");
    const dividendRouter = require("./routes/dividend");
    const salesyearRouter = require("./routes/salesyear");
    const quarterlySalesRouter = require("./routes/quarterlySales");

    // 라우트 등록
    app.use("/auth", authRouter);
    app.use("/user", usersRouter);
    app.use("/posts", postsRouter);
    app.use("/explains", explainsRouter);
    app.use("/calens", calensRouter);
    app.use("/search", searchRouter);
    app.use("/stockdata", stockDataRouter);
    app.use("/allchartdata", allChartRouter);
    app.use("/portfolios", portfoliosRouter);
    app.use("/companyInfo", companyInfoRouter);
    app.use("/yearResult", yearResultRouter);
    app.use("/volumes", volumeRouter);
    app.use("/dividend", dividendRouter);
    app.use("/salesyear", salesyearRouter);
    app.use("/quarterlySales", quarterlySalesRouter);

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
