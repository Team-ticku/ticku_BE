const express = require("express");
const router = express.Router();
const Explain = require("../models/Explain");

// 용어 설명
router.get("/ticko/:menu/:title", async (req, res) => {
  console.log("요청된 title: ", req.params.title);

  try {
    // 특정 title에 대한 설명 가져오기
    const explain = await Explain.findOne({ title: req.params.title });
    if (!explain) {
      return res.status(404).json({ message: "Title Not Found" });
    }
    res.status(200).json(explain);
  } catch (err) {
    res.status(500).json({ errer: err.message });
  }
});

module.exports = router;
