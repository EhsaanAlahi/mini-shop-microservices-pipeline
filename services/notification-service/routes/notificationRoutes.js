const express = require("express");

const {
    getNotifications,
    getUserNotifications
} = require("../controllers/notificationController");

const router = express.Router();


router.get(
    "/",
    getNotifications
);


router.get(
    "/user/:userId",
    getUserNotifications
);


module.exports = router;