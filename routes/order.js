


const { createOrder } = require('../controller/orderController')

const router = require('express').Router()


router.post("/", createOrder)

module.exports = router
