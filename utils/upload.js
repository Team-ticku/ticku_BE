const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @param {string} folder 저장할 폴더 이름 (예: "profile_images" or "post_images")
 */
const getUploadMiddleware = (folder) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder, // 업로드할 폴더 설정
      allowed_formats: ["jpg", "png", "jpeg"],
    },
  });

  return multer({ storage });
};

// 프로필 이미지 업로드 미들웨어
const uploadProfileImage = getUploadMiddleware("profile_images");

// 게시글 이미지 업로드 미들웨어
const uploadPostImage = getUploadMiddleware("post_images");

module.exports = { uploadProfileImage, uploadPostImage };
