const mongoose = require('mongoose');

// This sub-schema defines the structure for a single answer
const AnswerSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        // required: true,
        trim: true,
    },
});

const ResponseSchema = new mongoose.Schema({
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form', // Creates a reference to the Form model
        required: true,
    },
    answers: {
        type: [AnswerSchema], // An array of answers using the schema defined above
        required: true,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Response', ResponseSchema);