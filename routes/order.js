const { createOrder, getAllOrder } = require('../controller/orderController')

const router = require('express').Router()


router.post("/", createOrder)
router.get("/", getAllOrder)

module.exports = router
