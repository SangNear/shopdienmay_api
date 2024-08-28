const fs = require("fs");
const path = require("path");
const Product = require('../models/Product');
const { toSlug } = require('../lib/utils')


const createProduct = async (req, res) => {
    try {
        const { name, description, categories, price, quantity, specification, salePrice } = req.body;

        const images = req.file;

        if (!name) {
            return res.status(400).json("Title is not empty");
        }
        const nameIsExists = await Product.findOne({ name: name });
        if (nameIsExists) {
            return res.status(500).json("Name is exists! Choose another one");
        }
        // if (!image) {
        //     return res.status(400).json("Image is not empty");
        // }
        if (images) {
            const imgPath = path.join(__dirname, "../images", images.filename);
            const imgBase64 = fs.readFileSync(imgPath, { encoding: "base64" });
            var imgBase64URL = `data:image/${path
                .extname(images.filename)
                .slice(1)};base64,${imgBase64}`;
        }


        const newProduct = await Product.create({
            name,
            slug: toSlug(name),
            description,
            images: imgBase64URL,
            categories,
            quantity,
            price,
            salePrice,
            specification,
        });


        // fs.unlinkSync(imgPath);

        // if (categories) {
        //     for (const categoryId of categories) {
        //         const category = await Category.findById(categoryId)
        //         if (category) {
        //             category.products.push(newProduct._id)
        //             await category.save()
        //         }
        //         else {
        //             return res.status(500).json("Error while add new product in category")
        //         }
        //     }
        // }
        await newProduct.save();
        return res.status(200).json(newProduct);
    } catch (error) {
        console.log(error)
        return res.status(500).json("Product create failed!", error)
    }
};
const getAllProduct = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 })
        return res.status(200).json(products)
    } catch (error) {
        console.log(error)
        return res.status(404).json(error)
    }
}

module.exports = { createProduct, getAllProduct }