const mongoose = require("mongoose");

const indexDataSchema = new mongoose.Schema({
  symbol: { type: String, required: true }, // KOSPI 또는 KOSDAQ
  value: [
    {
      date: { type: String, required: true },
      close: { type: Number, required: true },
    },
  ],
  timestamp: { type: Date, default: Date.now }, // 받아온 시간
});

const IndexData = mongoose.model("IndexData", indexDataSchema);

module.exports = IndexData;
