const router = require('express').Router()
const multer = require("multer");
const fs = require('fs');
const path = require('path');
const { createProduct, getAllProduct, deleteProduct, getAllProductBySlug, getProductDetailBySlug, updateSpecialProduct } = require('../controller/productController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

router.post("/", upload.array("images", 10), createProduct)
router.get("/", getAllProduct)
router.get("/:slug", getAllProductBySlug)
router.get("/detail/:productSlug", getProductDetailBySlug)
router.delete("/:productId", deleteProduct)
router.put("/", updateSpecialProduct)
module.exports = router