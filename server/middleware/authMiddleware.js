const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// This function will be used to protect admin-only routes
const protect = async (req, res, next) => {
    let token;

    // Check if the request headers contain a bearer token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header (e.g., "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach the admin's user object to the request, excluding the password
            // This makes the admin's info available in all subsequent protected routes
            req.admin = await Admin.findById(decoded.id).select('-password');

            if (!req.admin) {
                 return res.status(401).json({ success: false, message: 'Not authorized, admin not found' });
            }

            next(); // Proceed to the next middleware or the route's controller
        } catch (error) {
            console.error(error);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

module.exports = { protect };