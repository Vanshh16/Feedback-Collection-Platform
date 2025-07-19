const Form = require('../models/Form');
const Response = require('../models/Response');

// @desc    Create a new feedback form
// @route   POST /api/forms
// @access  Private
 const createForm = async (req, res) => {
    
    const { title, description, questions } = req.body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: 'Please provide a title and at least one question' });
    }
    try {
        const form = await Form.create({
            title,
            description, // <-- Pass description to the create method
            questions,
            adminId: req.admin._id,
        });
        res.status(201).json(form);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all forms for the logged-in admin
// @route   GET /api/forms
// @access  Private
const getAdminForms = async (req, res) => {
    try {
        const forms = await Form.find({ adminId: req.admin._id }).sort({ createdAt: -1 });
        res.status(200).json(forms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single form by its ID
// @route   GET /api/forms/:id
// @access  Private
const getFormById = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }
        if (form.adminId.toString() !== req.admin._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to access this form' });
        }
        res.status(200).json(form);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a form by its public URL
// @route   GET /api/forms/public/:url
// @access  Public
const getPublicFormByUrl = async (req, res) => {
    try {
        // ***** ADD description to the select() method *****
        const form = await Form.findOne({ publicUrl: req.params.url }).select('title description questions status');

        if (!form) {
            return res.status(404).json({ message: 'Form not found or link is invalid' });
        }
        if (form.status === 'closed') {
            return res.status(403).json({ message: 'This form is no longer accepting responses.', formStatus: 'closed' });
        }
        res.status(200).json(form);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a form (title, questions, or status)
// @route   PUT /api/forms/:id
// @access  Private
const updateForm = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }
        if (form.adminId.toString() !== req.admin._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this form' });
        }

        const { title, description, questions, status } = req.body;

        if (status) {
            form.status = status;
            const updatedForm = await form.save();
            return res.status(200).json(updatedForm);
        }

        if (form.responseCount > 0) {
            return res.status(403).json({ message: 'Cannot edit a form that already has responses.' });
        }

        if (title) form.title = title;
        
        // Use `hasOwnProperty` to allow setting an empty string
        if (req.body.hasOwnProperty('description')) {
            form.description = description;
        }
        if (questions) form.questions = questions;

        const updatedForm = await form.save();
        res.status(200).json(updatedForm);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a form
// @route   DELETE /api/forms/:id
// @access  Private
const deleteForm = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }
        if (form.adminId.toString() !== req.admin._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this form' });
        }
        await form.deleteOne();
        await Response.deleteMany({ formId: req.params.id });
        res.status(200).json({ success: true, message: 'Form and all its responses have been deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createForm,
    getAdminForms,
    getFormById,
    getPublicFormByUrl,
    updateForm, 
    deleteForm,
};