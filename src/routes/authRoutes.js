// src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// ======================== AUTH ROUTES ========================

// User Signup
router.post('/signup', async (req, res) => {
    await AuthController.signup(req, res);
});

// User Login
router.post('/login', async (req, res) => {
    await AuthController.login(req, res);
});

// Get User Profile
router.get('/profile/:userId', async (req, res) => {
    await AuthController.getProfile(req, res);
});

// Check if Cashtag is available (for signup validation)
router.get('/check-cashtag/:cashtag', (req, res) => {
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/users.json'), 'utf8')) || [];
    const exists = users.some(user => 
        user.cashtag.toLowerCase() === req.params.cashtag.toLowerCase()
    );
    
    res.json({
        success: true,
        available: !exists,
        cashtag: req.params.cashtag
    });
});

// Check if Email is available
router.get('/check-email/:email', (req, res) => {
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/users.json'), 'utf8')) || [];
    const exists = users.some(user => 
        user.email.toLowerCase() === req.params.email.toLowerCase()
    );
    
    res.json({
        success: true,
        available: !exists,
        email: req.params.email
    });
});

// Logout (Client-side handled, but can be used for token blacklisting later)
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: "Logged out successfully"
    });
});

module.exports = router;