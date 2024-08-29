const { toSlug } = require("../lib/utils");
const Category = require("../models/Category");
const Product = require("../models/Product");

const getAllCategory = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 }).populate('products')
        return res.status(200).json(categories)
    } catch (error) {
        console.log(error)
        return res.status(404).json
    }
}
const createCategory = async (req, res) => {
    try {
        const { name, products } = req.body

        if (!name) {
            return res.status(400).json("Name is not empty");
        }

        const nameIsExits = await Category.findOne({ name: name })
        if (nameIsExits) {
            return res.status(500).json("Name is exists! Choose another one");
        }

        const newCategory = await Category({
            name,
            products,
            slug: toSlug(name)
        })

        // if (products) {
        //     for (const productId of products) {
        //         const product = await Product.findById(productId)
        //         if (product) {
        //             product.categories.push(newCategory._id)
        //             await product.save()
        //         }
        //         else {
        //             return 
        //         }
        //     }
        // }
        await newCategory.save()
        return res.status(200).json(newCategory);
    } catch (error) {
        console.log(error)
        return res.status(500).json("Category create failed!")
    }
}

module.exports = { createCategory, getAllCategory }