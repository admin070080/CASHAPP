// src/controllers/adminController.js

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');

// Helper Functions
const readData = (filePath) => {
    if (!fs.existsSync(filePath)) return [];
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
};

const writeData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing to ${filePath}:`, error);
    }
};

// ==================== ADMIN CONTROLLER ====================

class AdminController {

    /**
     * Create a new user (Admin only)
     */
    static createUser(req, res) {
        try {
            const { fullName, email, phone, cashtag } = req.body;

            if (!fullName || !email || !cashtag) {
                return res.status(400).json({
                    success: false,
                    message: "Full name, email and cashtag are required"
                });
            }

            let users = readData(USERS_FILE);

            // Check for duplicates
            if (users.some(user => user.email === email || user.cashtag === cashtag)) {
                return res.status(409).json({
                    success: false,
                    message: "User with this email or cashtag already exists"
                });
            }

            const newUser = {
                id: Date.now(),
                fullName: fullName.trim(),
                email: email.toLowerCase().trim(),
                phone: phone || null,
                cashtag: cashtag.startsWith('$') ? cashtag : '$' + cashtag.toLowerCase(),
                password: "cashapp123", // Default password (should be changed on first login)
                balance: 50.00, // Welcome bonus
                btcBalance: 0.0000,
                createdAt: new Date().toISOString(),
                role: "user"
            };

            users.push(newUser);
            writeData(USERS_FILE, users);

            console.log(`👤 Admin created new user: ${newUser.cashtag}`);

            res.status(201).json({
                success: true,
                message: "User created successfully with $50 welcome bonus",
                user: {
                    fullName: newUser.fullName,
                    email: newUser.email,
                    cashtag: newUser.cashtag,
                    balance: newUser.balance
                }
            });

        } catch (error) {
            console.error("Create User Error:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    /**
     * Send money to a user (Admin)
     */
    static sendMoney(req, res) {
        try {
            const { toCashtag, amount, note = "Admin Transfer" } = req.body;

            if (!toCashtag || !amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Valid cashtag and amount are required"
                });
            }

            let users = readData(USERS_FILE);
            let transactions = readData(TRANSACTIONS_FILE);

            const receiverIndex = users.findIndex(user => user.cashtag === toCashtag);

            if (receiverIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: "User not found with that cashtag"
                });
            }

            // Add money to receiver
            users[receiverIndex].balance = (users[receiverIndex].balance || 0) + parseFloat(amount);

            const transaction = {
                id: Date.now(),
                from: "ADMIN",
                to: toCashtag,
                amount: parseFloat(amount),
                type: "admin_credit",
                note: note,
                date: new Date().toISOString()
            };

            transactions.unshift(transaction);

            writeData(USERS_FILE, users);
            writeData(TRANSACTIONS_FILE, transactions);

            console.log(`💰 Admin sent $${amount} to ${toCashtag}`);

            res.json({
                success: true,
                message: `Successfully sent $${amount} to ${toCashtag}`,
                transaction
            });

        } catch (error) {
            console.error("Admin Send Money Error:", error);
            res.status(500).json({ success: false, message: "Failed to process transaction" });
        }
    }

    /**
     * Get all users (Admin)
     */
    static getAllUsers(req, res) {
        try {
            const users = readData(USERS_FILE);
            
            const sanitizedUsers = users.map(user => ({
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                cashtag: user.cashtag,
                balance: user.balance || 0,
                btcBalance: user.btcBalance || 0,
                phone: user.phone,
                createdAt: user.createdAt
            }));

            res.json({
                success: true,
                count: sanitizedUsers.length,
                users: sanitizedUsers
            });
        } catch (error) {
            res.status(500).json({ success: false, message: "Failed to fetch users" });
        }
    }
}

module.exports = AdminController;