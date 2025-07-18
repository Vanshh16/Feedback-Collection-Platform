const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token will expire in 30 days
    });
};

// @desc    Register a new admin
// @route   POST /api/auth/register
// @access  Public
const registerAdmin = async (req, res) => {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Check if admin already exists
        const adminExists = await Admin.findOne({ username });

        if (adminExists) {
            return res.status(400).json({ message: 'Admin with that username already exists' });
        }

        // Create new admin (password will be hashed by the pre-save hook in the model)
        const admin = await Admin.create({
            username,
            password,
        });

        if (admin) {
            res.status(201).json({
                _id: admin._id,
                username: admin.username,
                token: generateToken(admin._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid admin data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Authenticate admin & get token
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find admin by username, and explicitly include the password for comparison
        const admin = await Admin.findOne({ username }).select('+password');

        // Check if admin exists and if the provided password matches the stored hash
        if (admin && (await admin.matchPassword(password))) {
            res.json({
                _id: admin._id,
                username: admin.username,
                token: generateToken(admin._id),
            });
        } else {
            // Use a generic message for security
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// @desc    Get the logged-in admin's data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    // The 'protect' middleware has already run and attached the user to req.admin
    // We can just send it back.
    res.status(200).json(req.admin);
};


module.exports = {
    registerAdmin,
    loginAdmin,
    getMe,
};