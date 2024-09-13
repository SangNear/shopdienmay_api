const Order = require("../models/Order");
const { v4: uuidv4 } = require('uuid');

const createOrder = async (req, res) => {
    try {
        const {
            customerName,
            addr,
            email,
            phone,
            products,
            paymentMethod,
            status,
            totalPrice
        } = req.body;

        // Check if required fields are present
        if (!customerName || !addr || !email || !phone || !paymentMethod) {
            return res.status(400).json("Vui lòng nhập đủ thông tin mua hàng bao gồm: tên, địa chỉ, email, sdt, phương thức thanh toán");
        }

        // Generate a unique tracking number
        const trackingNumber = uuidv4();

        // Create a new order
        const newOrder = new Order({
            customerName,
            addr,
            email,
            phone,
            products,
            totalPrice,
            status,
            paymentMethod,
            trackingNumber
        });

        // Save the new order to the database
        await newOrder.save();
        console.log("api order:", newOrder);

        // Return a success response
        res.status(201).json({
            message: "Tạo hóa đơn thành công",
            order: newOrder
        });

    } catch (error) {
        res.status(500).json({ message: "Error creating order", error });
    }
};

const getAllOrder = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).populate("products")
        return res.status(200).json(orders)
    } catch (error) {
        console.log(error);
        return res.status(404).json(error);
    }
}

module.exports = { createOrder,getAllOrder };
