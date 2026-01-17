const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    fullName: { 
        type: String, 
        required: true 
    },
    dateOfBirth: { 
        type: Date, 
        required: true 
    },
    homeTown: { 
        type: String, 
        required: true 
    },
    role:{
        type: String,
        enum: ['admin', 'doctor', 'patient'],
        default:'patient'
    },
    medical_specialty:{
        type: String,
        default:''
    }
}, {timestamps: true});

module.exports = mongoose.model('User', UserSchema);