import multer from "multer";
import path from "path";

// penyimpanan sementara di memori ram
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => { // function untuk filter format gambar, cb adalah callback
    const ext = path.extname(file.originalname).toLowerCase()
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
        return cb(new Error("Yang bisa diinput hanya file berformat gambar (.jpg, .jpeg, .png)"))
    }
    cb(null, true)
}

const upload = multer({ storage, fileFilter })

export default upload