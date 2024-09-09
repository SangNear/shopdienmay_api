const fs = require("fs");
const path = require("path");
const Product = require('../models/Product');
const { toSlug } = require('../lib/utils');
const Category = require("../models/Category");
const { default: mongoose } = require("mongoose");


const createProduct = async (req, res) => {
    try {
        const { name, original, description, categories, price, quantity, specification, salePrice } = req.body;
        const files = req.files; // Uploaded files
        
        // Check if name exists
        if (!name) {
            return res.status(400).json("Product name is required.");
        }

        // Check for duplicate product name
        const nameExists = await Product.findOne({ name });
        if (nameExists) {
            return res.status(500).json("Product name already exists! Choose another one.");
        }

        // Convert uploaded files to image paths (this assumes multer saves the files to a folder like /uploads)
        let imagePaths = [];
        if (files && files.length > 0) {
            imagePaths = files.map(file => `/${file.filename}`); // Adjust this path based on your server config
        }

        // Validate and check if the category exists
        if (categories) {
            if (!mongoose.Types.ObjectId.isValid(categories)) {
                return res.status(400).json("Invalid category ID format.");
            }

            const category = await Category.findById(categories);
            if (!category) {
                return res.status(400).json("Category does not exist. Please check again.");
            }

            // Create the new product
            const newProduct = new Product({
                name,
                slug: toSlug(name),
                original,
                description,
                images: imagePaths, // Save the image paths as strings
                categories,
                quantity,
                price,
                salePrice,
                specification,
            });

            // Associate product with the category
            category.products.push(newProduct._id);
            await category.save();

            // Save the product
            await newProduct.save();
            console.log("Product created with images:", imagePaths);
            
            return res.status(200).json(newProduct);
        } else {
            return res.status(400).json("Category is required.");
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
};
const getAllProduct = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Lấy trang hiện tại từ query string, mặc định là 1
        const limit = 10; // Số lượng sản phẩm trên mỗi trang
        const skip = (page - 1) * limit; // Số lượng sản phẩm cần bỏ qua để lấy trang hiện tại

        // Đếm tổng số sản phẩm
        const totalProducts = await Product.countDocuments();

        // Tính tổng số trang cần thiết
        const totalPages = Math.ceil(totalProducts / limit);

        // Lấy sản phẩm theo phân trang
        const products = await Product.find()
            .sort({ createdAt: -1 })
            .populate("categories")
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            totalProducts,
            totalPages,
            currentPage: page,
            products,
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json(error);
    }
};
const getAllProductBySlug = async (req, res) => {
    try {
        const productSlug = req.params.slug;
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        // Xử lý các từ khóa từ slug
        const keywords = productSlug.replace(/-/g, ' ').split(' ').filter(keyword => keyword.trim() !== '');

        if (keywords.length === 0) {
            return res.status(400).json({ message: 'No valid search keywords provided' });
        }

        // Tạo điều kiện tìm kiếm cho mỗi từ khóa
        const searchConditions = keywords.map(keyword => ({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { slug: { $regex: keyword, $options: 'i' } }
            ]
        }));

        // Đếm tổng số sản phẩm tìm được
        const totalProducts = await Product.countDocuments({ $and: searchConditions });

        // Lấy sản phẩm theo phân trang
        const products = await Product.find({ $and: searchConditions })
            .skip(skip)
            .limit(limit);

        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }

        // Tính tổng số trang
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            totalProducts,
            totalPages,
            currentPage: page,
            products,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: "failed",
            message: 'Server error', 
            error 
        });
    }
};

const getProductDetailBySlug = async (req, res) => {
    
    const slug = req.params.productSlug

    try {
        const product = await Product.findOne({ slug: slug })

        if ( product && product.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }
        res.status(200).json(product);
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



module.exports = { createProduct, getAllProduct, deleteProduct, getAllProductBySlug, getProductDetailBySlug }