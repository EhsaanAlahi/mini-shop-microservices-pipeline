require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const notificationRoutes =
    require("./routes/notificationRoutes");

const startConsumer =
    require("./kafka/consumer");


const app = express();


app.use(cors());

app.use(express.json());


app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Notification service is running"
    });

});


app.use(
    "/api/notifications",
    notificationRoutes
);

const PORT = process.env.PORT || 3003;


const startServer = async () => {

    try {

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "Notification MongoDB connected"
        );


        await startConsumer();


        app.listen(PORT, () => {

            console.log(
                `Notification service running on port ${PORT}`
            );

        });

    } catch (error) {

        console.error(
            "Notification service startup error:",
            error
        );

        process.exit(1);

    }

};


startServer();