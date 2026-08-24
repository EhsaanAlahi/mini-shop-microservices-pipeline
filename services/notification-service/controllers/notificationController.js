const Notification = require("../models/Notification");


// GET ALL NOTIFICATIONS

const getNotifications = async (req, res) => {

    try {

        const notifications = await Notification.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
        });

    } catch (error) {

        console.error(
            "Get notifications error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications"
        });
    }
};


// GET USER NOTIFICATIONS

const getUserNotifications = async (req, res) => {

    try {

        const { userId } = req.params;

        const notifications = await Notification.find({
            userId
        }).sort({
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
        });

    } catch (error) {

        console.error(
            "Get user notifications error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch user notifications"
        });
    }
};


module.exports = {
    getNotifications,
    getUserNotifications
};