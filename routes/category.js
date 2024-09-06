const { createCategory, getAllCategory, deleteCategory } = require('../controller/categoryController')

const router = require('express').Router()


router.post("/", createCategory)
router.get("/", getAllCategory)
router.delete("/:categoryId", deleteCategory)
module.exports = router