import multer from "multer"
import path from "path"

// Uploads are held in memory rather than written to disk. The CSV is streamed
// once and never served back, and a disk destination ("uploads/") has to already
// exist - it is gitignored, so a fresh deployment has no such directory and the
// first upload would fail with ENOENT.
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname)
    if(ext !== ".csv")
        return cb(new Error("Only CSV Files allowed"), false);

    cb(null, true)
}

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 1000000 },
}).single("file")

export default upload
