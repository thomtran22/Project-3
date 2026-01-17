const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    title: { 
        type: String, 
        default: "Cuộc hội thoại mới"
    },
}, { timestamps: true });
module.exports = mongoose.model("Conversation", ConversationSchema);