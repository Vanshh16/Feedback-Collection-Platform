// const express = require('express');
// const router = express.Router();

// // Import the controller functions
// const {
//     registerAdmin,
//     loginAdmin,
//     getMe
// } = require('../controllers/authController');

// // Import the protection middleware
// const { protect } = require('../middleware/authMiddleware');

// // @route   POST /api/auth/register
// // @desc    Register a new admin
// // @access  Public
// router.post('/register', registerAdmin);

// // @route   POST /api/auth/login
// // @desc    Authenticate admin & get token
// // @access  Public
// router.post('/login', loginAdmin);

// // @route   GET /api/auth/me
// // @desc    Get the logged-in admin's data
// // @access  Private
// router.get('/me', protect, getMe);

// module.exports = router;









const express = require('express');
const router = express.Router();

// Import controller functions
const {
    registerAdmin,
    loginAdmin,
    getMe
} = require('../controllers/authController');

// Import middleware
const { protect } = require('../middleware/authMiddleware');

// Define routes and connect them to controller functions
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/me', protect, getMe);

// Export the router
module.exports = router;