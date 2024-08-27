import multer from "multer";
import fs from "fs"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        const path = "./public/temp"
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true })
        }
        return cb(null, path)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

// Create the multer instance
const upload = multer({ storage: storage });

export default upload