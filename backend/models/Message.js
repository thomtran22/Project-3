//Lưu nội dung chat theo từng phiên
const mongoose = require("mongoose");
const MessageSchema = new mongoose.Schema({
    conversation:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation', 
        required: true
    },
    sender: { 
        type: String, 
        enum: ['user', 'ai'], 
        required: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    sources: { 
        type: Array, 
        default: [] 
    }
}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);