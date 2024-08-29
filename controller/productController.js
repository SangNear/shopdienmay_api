const fs = require("fs");
const path = require("path");
const Product = require('../models/Product');
const { toSlug } = require('../lib/utils');
const Category = require("../models/Category");
const { default: mongoose } = require("mongoose");


const createProduct = async (req, res) => {
    try {
        const { name, description, categories, price, quantity, specification, salePrice } = req.body;
        const images = req.files;
        console.log("file images", images);
        

        if (!name) {
            return res.status(400).json("Title is not empty");
        }

        const nameIsExists = await Product.findOne({ name: name });
        if (nameIsExists) {
            return res.status(500).json("Name already exists! Choose another one");
        }

        let imgBase64URLs = [];
        if (images && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                const imgPath = path.join(__dirname, "../images", images[i].filename);
                const imgBase64 = fs.readFileSync(imgPath, { encoding: "base64" });
                const imgBase64URL = `data:image/${path.extname(images[i].filename).slice(1)};base64,${imgBase64}`;
                imgBase64URLs.push(imgBase64URL);
            }
        }

        // Validate the single category ID
        if (categories) {
            if (!mongoose.Types.ObjectId.isValid(categories)) {
                return res.status(400).json("Invalid category ID format.");
            }

            const category = await Category.findById(categories);
            if (!category) {
                return res.status(400).json("Category ID does not exist. Please check again.");
            }

            // Create the product only if the category is valid and exists
            const newProduct = new Product({
                name,
                slug: toSlug(name),
                description,
                images: imgBase64URLs,
                categories: categories, // Using the valid category ID
                quantity,
                price,
                salePrice,
                specification,
            });

            // Associate the product with the category
            category.products.push(newProduct._id);
            await category.save();

            // Save the product after successful association with the category
            await newProduct.save();
            return res.status(200).json(newProduct);
        } else {
            return res.status(400).json("Category is required.");
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
};
const getAllProduct = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 }).populate("categories")
        return res.status(200).json(products)
    } catch (error) {
        console.log(error)
        return res.status(404).json(error)
    }
}

const getAllProductBySlug = async (req, res) => {
    try {
        const productSlug = req.params.slug
        console.log("slug", productSlug);


        // const keywords = productSlug.split(' ').filter(keyword => keyword.trim() !== '');

        // if (keywords.length === 0) {
        //     return res.status(400).json({ message: 'No valid search keywords provided' });
        // }

        const keywords = productSlug.replace(/-/g, ' ').split(' ').filter(keyword => keyword.trim() !== '');

        if (keywords.length === 0) {
            return res.status(400).json({ message: 'No valid search keywords provided' });
        }

        // Construct search conditions for each keyword
        const searchConditions = keywords.map(keyword => ({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { slug: { $regex: keyword, $options: 'i' } }
            ]
        }));

        // Use $and to ensure all keywords are present
        const products = await Product.find({ $and: searchConditions });
        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }
        res.status(200).json(products);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
}

const deleteProduct = async (req, res) => {
    const { productId } = req.params;

    try {
        // Xóa sản phẩm khỏi bảng Product
        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Xóa sản phẩm khỏi bảng Category
        await Category.updateMany(
            { products: productId },
            { $pull: { products: productId } }
        );

        res.status(200).json({ message: 'Product and its references in categories were deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error', error });
    }
}



module.exports = { createProduct, getAllProduct, deleteProduct, getAllProductBySlug }