const mongoose = require('mongoose');
const { randomBytes } = require('crypto');

// This sub-schema defines the structure for a single question within a form
const QuestionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
        trim: true,
    },
    questionType: {
        type: String,
        enum: [
            'text', 
            'paragraph', 
            'multiple-choice', 
            'checkboxes', 
            'dropdown', 
            'rating-scale'
        ],
        required: true,
    },
    // This field will only be used if the question type has options
    options: {
        type: [String],
        default: undefined,
    },
    // New field to mark a question as mandatory
    required: {
        type: Boolean,
        default: false,
    }
});


const FormSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a form title'],
        trim: true,
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
    },
    questions: {
        type: [QuestionSchema],
        validate: [val => val.length >= 1, 'Form must have at least one question']
    },
    publicUrl: {
        type: String,
        unique: true,
    },
    // New field to control if the form is accepting responses
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open',
    },
    // New field to track the number of responses, useful for the "Edit" constraint
    responseCount: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

// Before saving a new form, generate a unique public URL
FormSchema.pre('save', function(next) {
    if (this.isNew) {
        this.publicUrl = randomBytes(4).toString('hex');
    }
    next();
});


module.exports = mongoose.model('Form', FormSchema);