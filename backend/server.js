require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const path = require('path'); // Thêm thư viện path
const authRoutes = require("./routes/auth");
const docRoutes = require("./routes/docs");
const chatRoutes = require('./routes/chat');
const adminRoutes = require("./routes/admin");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/uploads", (req, res, next) => {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    next();
}, express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/docs", docRoutes);
app.use('/api/chat', chatRoutes); 
app.use('/api/admin', adminRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Đã kết nối thành công!"))
    .catch(err => console.log("Lỗi kết nối MongoDB", err))

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});