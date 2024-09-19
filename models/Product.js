const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        slug: {
            type: String,
            require: true,
            unique: true
        },
        original: {
            type: String,
        },
        brands: {
            type: String,
        },
        size: {
            type: String
        },
        color: {
            type: String
        },
        guarantee: {
            type: String,
        },
        price: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: true
        },

        categories: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        },
        images: {
            type: [String]
        },
        quantity: {
            type: Number,
        },

        salePrice: {
            type: Number
        },
        specification: {
            type: Map,
            of: String
        },
        specials: {
            type: Boolean
        }

    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Product', ProductSchema)