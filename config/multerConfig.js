const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Fayllarni saqlash yo‘li
const uploadPath = "public/uploads/chat";

// Agar katalog mavjud bo‘lmasa, uni yaratish
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// Fayl saqlash sozlamalari
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtr: faqat rasm va audio fayllarga ruxsat berish
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("audio/")) {
        cb(null, true);
    } else {
        cb(new Error("Faqat rasm va audio fayllar qabul qilinadi!"), false);
    }
};

// Fayl hajmini cheklash (10MB dan katta fayllarni qabul qilmaslik)
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = upload;
