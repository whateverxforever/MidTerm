const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Course = new Schema({
    code: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    faculty: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Course', Course);