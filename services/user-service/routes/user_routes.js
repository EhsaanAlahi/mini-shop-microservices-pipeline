const express = require("express");

const {
    signupAdmin,
    loginAdmin
} = require("../controller/user_controller");

const router = express.Router();

router.post(
    "/signup",
    signupAdmin
);

router.post(
    "/login",
    loginAdmin
);


module.exports = router;