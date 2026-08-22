const express = require("express");
const cors = require("cors");

const connectDB = require("./config/database");

const productRoutes = require("./routes/product_routes");


const app = express();


// Middleware

app.use(cors());

app.use(express.json());


// Database

connectDB();


// Health

app.get("/", (req, res) => {

    res.json({
        success: true,
        service: "product-service",
        message: "Product service is running"
    });

});


// Product routes

app.use(
    "/api/products",
    productRoutes
);


const PORT = process.env.PORT || 4000;


app.listen(PORT, () => {

    console.log(
        `Product service running on port ${PORT}`
    );

});