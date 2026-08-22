const Product = require("../model/product");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

// CREATE PRODUCT

const createProduct = async (req, res) => {

    try {

        const {
            name,
            description,
            price,
            category,
            stock,
        } = req.body;


        // Basic validation

        if (!name || !price) {

            return res.status(400).json({
                success: false,
                message: "Name and price are required",
            });
        }


        let imageUrl = null;
        let imagePublicId = null;


        // Upload image to Cloudinary

        if (req.file) {

            const result = await uploadToCloudinary(
                req.file.buffer
            );

            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
        }


        // Create product

        const product = await Product.create({

            name,

            description,

            price,

            category,

            stock,

            imageUrl,

            imagePublicId,

        });


        res.status(201).json({

            success: true,

            message: "Product created successfully",

            product,

        });


    } catch (error) {

        console.error(
            "Create product error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Failed to create product",

            error: error.message,

        });
    }
};


// GET ALL PRODUCTS

const getProducts = async (req, res) => {

    try {

        const products = await Product.find()
            .sort({ createdAt: -1 });


        res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });
    }
};



// GET SINGLE PRODUCT

const getProduct = async (req, res) => {

    try {

        const product = await Product.findById(
            req.params.id
        );


        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to fetch product"
        });
    }
};



// UPDATE PRODUCT

const updateProduct = async (req, res) => {

    try {

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );


        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update product"
        });
    }
};



// DELETE PRODUCT

const deleteProduct = async (req, res) => {

    try {

        const product = await Product.findByIdAndDelete(
            req.params.id
        );


        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete product"
        });
    }
};


module.exports = {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct
};