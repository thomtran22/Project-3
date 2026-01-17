const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    content: { type: String },
    embedding: { type: [Number] },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isGlobal: { type: Boolean, default: false, index: true },
    sharedWith: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        index: true // Sửa lỗi AI báo bận khi chat hồ sơ riêng
    }],
    status: { type: String, default: 'ready' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);