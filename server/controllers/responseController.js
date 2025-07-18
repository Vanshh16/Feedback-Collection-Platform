const Response = require('../models/Response');
const Form = require('../models/Form');
const { Parser } = require('json2csv');

// @desc    Submit a response to a form
// @route   POST /api/responses/:formId
// @access  Public
const submitResponse = async (req, res) => {
    const { answers } = req.body;
    const { formId } = req.params;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ message: 'Please provide answers to the questions' });
    }

    try {
        const form = await Form.findById(formId);
        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }
        // Also check if the form is open before accepting a response
        if (form.status === 'closed') {
            return res.status(403).json({ message: 'This form is no longer accepting responses.' });
        }

        const newResponse = await Response.create({
            formId,
            answers,
        });

        // ***** NEW LOGIC *****
        // Increment the response count on the form and save it.
        // We use $inc for an atomic update, which is safe and efficient.
        await Form.updateOne({ _id: formId }, { $inc: { responseCount: 1 } });

        res.status(201).json({ success: true, message: 'Response submitted successfully', response: newResponse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all responses for a specific form
// @route   GET /api/responses/:formId
// @access  Private
const getFormResponses = async (req, res) => {
    try {
        const form = await Form.findById(req.params.formId);
        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }
        if (form.adminId.toString() !== req.admin._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to view these responses' });
        }
        const responses = await Response.find({ formId: req.params.formId }).sort({ createdAt: -1 });
        res.status(200).json(responses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Export all responses for a form to a CSV file
// @route   GET /api/responses/:formId
// @access  Private
const exportResponsesToCsv = async (req, res) => {
    try {
        const form = await Form.findById(req.params.formId);
        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }
        if (form.adminId.toString() !== req.admin._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const responses = await Response.find({ formId: req.params.formId }).lean();
        if (responses.length === 0) {
            return res.status(404).json({ message: 'No responses to export' });
        }
        const questionHeaders = form.questions.map(q => q.questionText);
        const fields = ['submittedAt', ...questionHeaders];
        const transformedData = responses.map(response => {
            const row = {
                submittedAt: response.createdAt.toISOString().split('T')[0],
            };
            response.answers.forEach(answer => {
                row[answer.questionText] = answer.answer;
            });
            return row;
        });
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(transformedData);
        res.header('Content-Type', 'text/csv');
        res.attachment(`form-${form.publicUrl}-responses.csv`);
        res.send(csv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    submitResponse,
    getFormResponses,
    exportResponsesToCsv,
};