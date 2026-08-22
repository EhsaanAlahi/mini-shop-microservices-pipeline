const express = require("express");
const cors = require("cors");

const connectDB = require("./config/database");
const adminRoutes = require("./routes/user_routes");

const app = express();

app.use(cors());
app.use(express.json());


connectDB();
app.use(
    "/api/admin",
    adminRoutes
);


app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "user-service"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});