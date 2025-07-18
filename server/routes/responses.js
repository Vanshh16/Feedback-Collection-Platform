const express = require('express');
const router = express.Router();

// Import controller functions from responseController.js
const {
    submitResponse,
    getFormResponses,
    exportResponsesToCsv
} = require('../controllers/responseController');

// Import the protection middleware
const { protect } = require('../middleware/authMiddleware');


// @route   POST /api/responses/:formId
// @desc    A public route for anyone to submit a response to a form
// @access  Public
router.post('/:formId', submitResponse);


// @route   GET /api/responses/:formId
// @desc    A private route for the form owner to get all responses
// @access  Private
router.get('/:formId', protect, getFormResponses);


// @route   GET /api/responses/:formId/export
// @desc    A private route for the form owner to export responses to CSV
// @access  Private
router.get('/:formId/export', protect, exportResponsesToCsv);


module.exports = router;