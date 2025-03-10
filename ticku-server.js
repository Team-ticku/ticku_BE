const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt"); // 암호화
const jwt = require("jsonwebtoken"); // 토큰

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); //모든 도메인(포트)의 요청을 허용(테스트서버용)
app.use(express.json());

// MongoDB Atlas 연결
const MONGO_URI =
  "mongodb+srv://zangwoo:wtKWPTSuLx2dIizc@mongodb-ticku.xjix5.mongodb.net/tickudb";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Mongoose 모델 정의
const UserSchema = new mongoose.Schema(
  {
    uid: String,
    password: String,
    name: String,
  },
  { collection: "users" } // 컬렉션 이름 지정
);

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

// 계정 DB
const User = mongoose.model("User", UserSchema);

// 아이디 중복 확인
app.post("/check-in", async (req, res) => {
  const uid = req.body.uid;

  try {
    const existingUser = await User.findOne({ uid });

    // 아이디가 이미 존재하면 isIdDuplicate를 true로 반환
    if (existingUser) {
      return res.json({ isIdDuplicate: true });
    }
    res.json({ isIdDuplicate: false });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "서버오류" });
  }
});

// 회원가입
app.post("/join", async (req, res) => {
  const { uid, password, name } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ uid, password: hashedPassword, name });
    await newUser.save();

    res.status(201).send({ message: "회원가입 성공" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "회원가입 오류" });
  }
});

// 로그인
app.post("/login", async (req, res) => {
  const { uid, password } = req.body;

  try {
    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(400).json({ message: "사용자가 존재하지 않습니다." });
    }

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "비밀번호가 틀렸습니다." });
    }

    const token = jwt.sign({ id: user._id, uid: user.uid }, "secretkey", {
      expiresIn: "1h",
    });

    res.json({ message: "로그인 성공", token, userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 커뮤니티 포스트
const Post = mongoose.model("Post", PostsSchema);

// 커뮤니티 게시글 조회
app.get("/posts", async (req, res) => {
  try {
    //users 콜렉션의 모든 도큐먼트 리스트를 가져온다.
    const posts = await Post.find();
    console.log(posts);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 커뮤니티 게시글 단건 조회
app.get("/posts/:id", async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);
    if (!posts) {
      return res.status(404).json({ message: "Post Not Found" });
    }
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//서버 실행
app.listen(PORT, () => {
  console.log(`블로그 REST API 서버(${PORT}) 실행중...`);
});
