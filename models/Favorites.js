const mongoose = require("mongoose");

const FavoritesSchema = new mongoose.Schema(
  {
    name: String,
    isFavorite: Boolean,
    //userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userId: String,
  },
  { collection: "favorites" }
);

// 계정 DB
const Favorites = mongoose.model("Favorites", FavoritesSchema);

// User 모델 외부로 내보내기기
module.exports = Favorites;
