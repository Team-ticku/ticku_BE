const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    corp_code: { type: String, required: true },
    corp_name: { type: String, required: true },
    stock_code: { type: String, required: true },
  },
  { collection: "companylist" } // 컬렉션 이름 강제 지정);
);

const Company = mongoose.model("Company", companySchema);

module.exports = { Company };
