import multer from "multer"
import path from "path"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "upload/")
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname)
    if(ext !== ".csv")
        return cb(new Error("Only CSV Files allowed"), false);

    cb(null, true)
}

const upload = multer({storage, fileFilter, limits: { fileSize: 1000000 }}).single("file")

export default upload
