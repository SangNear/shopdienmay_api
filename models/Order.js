const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema(
    {
        customerName: {
            type: String,
            required: true
        },
        addr: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        ],
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'canceled'],
            default: 'pending'
        },
        totalPrice: {
            type: Number,
            required: true
        },
        paymentMethod: {
            type: String,
            required: true
        },
        trackingNumber: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Order', OrderSchema)