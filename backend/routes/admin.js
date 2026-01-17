const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const auth = require('../middleware/authMiddleware'); 
router.get('/patients', auth, async (req, res) => {
    try {
        const patients = await User.find({ role: 'patient' })
            .select('-password')
            .sort({ createdAt: -1 }); 

        res.json(patients);
    } catch (err) {
        console.error("Lỗi Server:", err.message);
        res.status(500).send('Lỗi máy chủ nội bộ');
    }
});

router.get('/doctors', auth, async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }) // Tìm người có role là doctor
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(doctors);
    } catch (err) {
        res.status(500).send('Lỗi lấy danh sách bác sĩ');
    }
});

module.exports = router;