// src/controllers/authController.js

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Helper Functions
const readUsers = () => {
    if (!fs.existsSync(USERS_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (error) {
        console.error("Error reading users file:", error);
        return [];
    }
};

const writeUsers = (users) => {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error("Error writing users file:", error);
    }
};

class AuthController {

    /**
     * User Signup
     */
    static async signup(req, res) {
        try {
            const { fullName, email, phone, cashtag, password } = req.body;

            // Validation
            if (!fullName || !email || !cashtag || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Full name, email, cashtag and password are required"
                });
            }

            let users = readUsers();

            // Check for existing user
            const existingUser = users.find(user => 
                user.email.toLowerCase() === email.toLowerCase() || 
                user.cashtag.toLowerCase() === cashtag.toLowerCase()
            );

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "User with this email or cashtag already exists"
                });
            }

            // Create new user
            const newUser = {
                id: Date.now(),
                fullName: fullName.trim(),
                email: email.toLowerCase().trim(),
                phone: phone ? phone.trim() : null,
                cashtag: cashtag.startsWith('$') ? cashtag : '$' + cashtag.toLowerCase().replace(/\s/g, ''),
                password: password, // In production: Use bcrypt to hash password
                balance: 50.00,           // Welcome Bonus
                btcBalance: 0.0000,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                role: "user"
            };

            users.push(newUser);
            writeUsers(users);

            console.log(`✅ New user registered: ${newUser.cashtag} (${newUser.email})`);

            // Return user without password
            const { password: _, ...userWithoutPassword } = newUser;

            res.status(201).json({
                success: true,
                message: "Account created successfully! Welcome bonus of $50 added.",
                user: userWithoutPassword
            });

        } catch (error) {
            console.error("Signup Error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error during signup"
            });
        }
    }

    /**
     * User Login
     */
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Email and password are required"
                });
            }

            const users = readUsers();
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            // Simple password check (In production: use bcrypt.compare)
            if (user.password !== password) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            // Update last login
            user.lastLogin = new Date().toISOString();
            writeUsers(users);

            // Remove password from response
            const { password: _, ...userData } = user;

            console.log(`🔐 User logged in: ${user.cashtag}`);

            res.json({
                success: true,
                message: "Login successful",
                user: userData
            });

        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error during login"
            });
        }
    }

    /**
     * Get Current User Profile
     */
    static async getProfile(req, res) {
        try {
            const { userId } = req.params;
            const users = readUsers();
            const user = users.find(u => u.id === parseInt(userId));

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            const { password: _, ...profile } = user;
            res.json({ success: true, user: profile });

        } catch (error) {
            res.status(500).json({ success: false, message: "Failed to fetch profile" });
        }
    }
}

module.exports = AuthController;