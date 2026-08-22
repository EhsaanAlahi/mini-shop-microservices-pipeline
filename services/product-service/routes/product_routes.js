const express = require("express");
const upload = require("../middleware/upload");
const {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct
} = require("../controller/product_controller");


const router = express.Router();


router.post("/signup", upload.single("image"), createProduct);

router.get("/", getProducts);

router.get("/:id", getProduct);

router.put("/:id", upload.single("image"), updateProduct);

router.delete("/:id", deleteProduct);


module.exports = router;