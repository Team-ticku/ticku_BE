const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

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
const UsersSchema = new mongoose.Schema(
  {
    userid: String,
    userpw: String,
    nickname: String,
  },
  { collection: "users" } // 컬렉션 이름 강제 지정
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
const User = mongoose.model("User", UsersSchema);

// 계정 목록 조회
app.get("/users", async (req, res) => {
  try {
    //users 콜렉션의 모든 도큐먼트 리스트를 가져온다.
    const users = await User.find();
    console.log(users);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 계정 단건 조회
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 계정 추가
app.post("/users", async (req, res) => {
  try {
    const { userid, userpw, nickname } = req.body;
    //새 도큐먼트 객체 만들기
    const newUser = new User({ userid, userpw, nickname });
    await newUser.save(); //도큐먼트 저장!
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 계정 수정
app.put("/users/:id", async (req, res) => {
  try {
    const { userid, userpw, nickname } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { userid, userpw, nickname },
      { new: true } //업데이트된 도큐먼트를 리턴한다.
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User Not Found" });
    }
    res.status(201).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 계정 삭제
app.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User Deleted" });
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
