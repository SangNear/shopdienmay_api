const { createCategory, getAllCategory } = require('../controller/categoryController')

const router = require('express').Router()


router.post("/", createCategory)
router.get("/", getAllCategory)
module.exports = router