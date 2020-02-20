const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    courses: {
        type: Array,
        required: false
    },
    isFaculty: {
        type: Boolean,
        deafult: false
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('User', User);