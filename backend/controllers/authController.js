const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Register
exports.register = async (req, res) => {
    try{
        const { username, password, role, medical_specialty, fullName, homeTown, dateOfBirth } = req.body;
        let user = await User.findOne({ username });
        if(user) return res.status(400).json({msg: "Người dùng đã tồn tại"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ username, password: hashedPassword, role, medical_specialty, fullName, homeTown, dateOfBirth});
        await user.save();
        res.status(201).json({ msg: "Đăng ký thành công!"});
    } catch(err){
        res.status(500).send("Lỗi server");
    }
}
//Login
exports.login = async (req, res) => {
    try{
        const { username, password } = req.body;
        //Kiểm tra username
        const user = await User.findOne({username});
        if(!user) return res.status(400).json({msg: "Tài khoản không tổn tại"});
        //Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({msg: "Mật khẩu không đúng"});

        //Tạo token
        const payLoad = { userId: user._id, role: user.role, username: user.username};
        const token = jwt.sign(payLoad, process.env.JWT_SECRET, { expiresIn: '1d'});

        res.json({
            token,
            user: {id: user._id, username: user.username}
        });
    }catch(err){
        res.status(500).send("Lỗi server");
    }
}

//Profile
exports.getMe = async (req, res) => {
    try {
        // Kiểm tra xem middleware có chạy không
        if (!req.user) {
            return res.status(401).json({ msg: "Middleware chưa gán req.user" });
        }

        // Tìm bằng userId (phải khớp với tên trong payload lúc Login)
        const user = await User.findById(req.user.userId).select("-password"); 
        
        if (!user) {
            return res.status(404).json({ msg: "ID này không tồn tại trong DB" });
        }

        res.json(user);
    } catch (err) {
        console.error("LỖI CHI TIẾT:", err); // In lỗi ra terminal để xem
        res.status(500).json({ msg: "Lỗi server", error: err.message });
    }
};