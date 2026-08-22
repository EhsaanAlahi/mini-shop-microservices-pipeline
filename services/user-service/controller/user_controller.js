const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../model/user");


const signupAdmin = async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // Validate fields

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });

        }


        // Password validation

        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });

        }


        // Normalize email

        const normalizedEmail = email
            .trim()
            .toLowerCase();


        // Check existing admin

        const existingAdmin = await Admin.findOne({
            email: normalizedEmail
        });


        if (existingAdmin) {

            return res.status(409).json({
                success: false,
                message: "Admin with this email already exists"
            });

        }


        // Hash password

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // Create admin

        const admin = await Admin.create({

            name: name.trim(),

            email: normalizedEmail,

            password: hashedPassword,

            role: "admin",

            isActive: true

        });


        return res.status(201).json({

            success: true,

            message: "Admin created successfully",

            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }

        });

    } catch (error) {

        console.error(
            "Admin signup error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
};



const loginAdmin = async (req, res) => {

    try {

        const { email, password } = req.body;
        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });

        }

        const admin = await Admin.findOne({
            email: email.toLowerCase(),
        });


        if (!admin) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });

        }


        if (!admin.isActive) {

            return res.status(403).json({
                success: false,
                message: "Admin account is disabled",
            });

        }


        const passwordMatch = await bcrypt.compare(
            password,
            admin.password
        );


        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });

        }


        // Create JWT

        const token = jwt.sign(
            {
                id: admin._id,
                email: admin.email,
                role: admin.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );


        // Response

        return res.status(200).json({

            success: true,

            message: "Admin login successful",

            token,

            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },

        });

    } catch (error) {

        console.error("Admin login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }
};


module.exports = {
    signupAdmin,
    loginAdmin
};