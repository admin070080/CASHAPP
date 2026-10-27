// src/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');

// Middleware to protect admin routes (simple version)
const isAdmin = (req, res, next) => {
    // In a real app, you would check JWT token or session for admin role
    const adminKey = req.headers['x-admin-key'];
    
    if (adminKey !== 'cashapp-admin-2026') {  // Demo admin key
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required."
        });
    }
    next();
};

// ======================== ADMIN ROUTES ========================

// Create New User
router.post('/create-user', isAdmin, AdminController.createUser);

// Send Money to Any User
router.post('/send-money', isAdmin, AdminController.sendMoney);

// Get All Users
router.get('/users', isAdmin, AdminController.getAllUsers);

// Get Single User by Cashtag
router.get('/user/:cashtag', isAdmin, (req, res) => {
    const users = require('../controllers/adminController').getAllUsers(); // Reuse helper if needed
    const user = users.find(u => u.cashtag.toLowerCase() === req.params.cashtag.toLowerCase());
    
    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(404).json({ success: false, message: "User not found" });
    }
});

// Get System Statistics
router.get('/stats', isAdmin, (req, res) => {
    const users = require('../controllers/adminController').getAllUsers();
    const transactions = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/transactions.json'), 'utf8')) || [];

    res.json({
        success: true,
        stats: {
            totalUsers: users.length,
            totalTransactions: transactions.length,
            totalBalance: users.reduce((sum, user) => sum + (user.balance || 0), 0).toFixed(2),
            activeUsers: users.length // Can be improved with lastLogin
        }
    });
});

module.exports = router;