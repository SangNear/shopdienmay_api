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

        //check whether name is exists in database
        if (!name) {
            return res.status(400).json("Title is not empty");
        }

        const nameIsExists = await Product.findOne({ name: name });
        if (nameIsExists) {
            return res.status(500).json("Name already exists! Choose another one");
        }


        //convert images to base 64
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
        const page = parseInt(req.query.page) || 1; // Lấy trang hiện tại từ query string, mặc định là 1
        const limit = 5; // Số lượng sản phẩm trên mỗi trang
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