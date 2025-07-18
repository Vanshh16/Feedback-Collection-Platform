const express = require('express');
const router = express.Router();

// Import controller functions
const {
    createForm,
    getAdminForms,
    getFormById,
    updateForm, // <-- Import the new update function
    deleteForm,
    getPublicFormByUrl
} = require('../controllers/formController');

// Import protection middleware
const { protect } = require('../middleware/authMiddleware');

// --- Private Routes (require admin authentication) ---

// This route handles creating new forms and getting all forms for the admin
router.route('/')
    .post(protect, createForm)
    .get(protect, getAdminForms);

// This route handles getting, DELETING, and now UPDATING a specific form
router.route('/:id')
    .get(protect, getFormById)
    .put(protect, updateForm) // <-- This is the new line
    .delete(protect, deleteForm);

// --- Public Route (no authentication needed) ---

router.get('/public/:url', getPublicFormByUrl);


module.exports = router;