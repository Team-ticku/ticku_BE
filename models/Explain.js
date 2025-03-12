const mongoose = require("mongoose");

const ExplainSchema = new mongoose.Schema({
  title: String,
  context: String,
});

const Explain = mongoose.model("Explain", ExplainSchema);

// Post 모델 외부 내보내기
module.exports = Explain;
