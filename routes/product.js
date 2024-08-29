const router = require('express').Router()
const multer = require("multer");
const fs = require('fs');
const path = require('path');
const { createProduct, getAllProduct, deleteProduct, getAllProductBySlug } = require('../controller/productController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("images"), createProduct)
router.get("/", getAllProduct)
router.get("/:slug", getAllProductBySlug)
router.delete("/:productId", deleteProduct)
module.exports = router