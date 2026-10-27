// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cashappmvp.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminpassword123'; // Secure admin password

// Safely require mailer if it exists, otherwise provide a dummy function to prevent crashes
let sendEmail = async () => {};
try {
    const mailer = require('./src/utils/mailer');
    if (mailer && mailer.sendEmail) {
        sendEmail = mailer.sendEmail;
    }
} catch (e) {
    console.log("⚠️ Mailer module not found. Running server without email alerts.");
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Data file paths
const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate realistic default Bitcoin address (Native SegWit format)
const generateBtcAddress = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let addr = 'bc1q';
    for (let i = 0; i < 38; i++) {
        addr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return addr;
};

// Robust Helper functions with fail-safes for empty/corrupted files
const readData = (file) => {
    try {
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, JSON.stringify([], null, 2));
            return [];
        }
        const fileContent = fs.readFileSync(file, 'utf8');
        if (!fileContent || fileContent.trim() === '') {
            return [];
        }
        return JSON.parse(fileContent);
    } catch (error) {
        console.error(`Error reading ${file}:`, error.message);
        return [];
    }
};

const writeData = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Professional Branded Email Template Wrapper
const getEmailTemplate = (title, messageBody) => {
    return `
        <div style="font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7f9fa; padding: 40px 0; color: #1a1a1a;">
            <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center;">
                
                <!-- Logo & Brand Header -->
                <div style="margin-bottom: 24px;">
                    <div style="display: inline-block; width: 50px; height: 50px; background-color: #00D632; border-radius: 16px; color: white; font-size: 30px; font-weight: bold; line-height: 50px; text-align: center; margin-bottom: 10px;">$</div>
                    <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #111111;">CashApp MVP</h2>
                </div>

                <!-- Main Content Box -->
                <div style="text-align: left; font-size: 15px; line-height: 1.5; color: #4b5563; border-top: 1px solid #f3f4f6; padding-top: 24px;">
                    <h3 style="color: #111111; font-size: 18px; margin-top: 0;">${title}</h3>
                    ${messageBody}
                </div>

                <!-- Footer -->
                <div style="border-top: 1px solid #f3f4f6; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #9ca3af;">
                    <p style="margin: 0;">This is an automated notification from your CashApp MVP system.</p>
                    <p style="margin: 5px 0 0 0;">&copy; 2026 CashApp MVP. All rights reserved.</p>
                </div>
            </div>
        </div>
    `;
};

// ======================== ROUTES ========================

// Secure Admin Authentication Route
app.post('/api/admin/auth', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, message: "Authorized" });
    } else {
        res.status(401).json({ success: false, message: "Invalid admin password" });
    }
});

// Auth Routes - Signup with Automatic Cashtag Generation & Default BTC Address
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;
        
        let users = readData(USERS_FILE);

        // Check if email already exists
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ success: false, message: "Email is already registered" });
        }

        let baseCashtag = '$' + fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
        let cashtag = baseCashtag;
        let counter = 1;

        while (users.some(u => u.cashtag === cashtag)) {
            cashtag = `${baseCashtag}${counter}`;
            counter++;
        }

        const newUser = {
            id: Date.now(),
            fullName,
            email,
            phone: phone || '',
            cashtag,
            password,
            balance: 50.00,
            btcBalance: 0.0000,
            btcAddress: generateBtcAddress(), // Unique default BTC address
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        writeData(USERS_FILE, users);

        // Welcome Email
        try {
            const welcomeHtml = getEmailTemplate(
                'Welcome to CashApp MVP!',
                `<p>Hello <b>${fullName}</b>,</p>
                 <p>Your account has been successfully created.</p>
                 <p>Your automatically generated Cashtag is: <b>${cashtag}</b></p>
                 <p style="background: #f0fdf4; color: #166534; padding: 12px 16px; border-radius: 12px; font-weight: bold; margin-top: 20px;">
                    Enjoy your $50.00 welcome bonus!
                 </p>`
            );
            await sendEmail(email, 'Welcome to CashApp MVP!', welcomeHtml);
        } catch (emailErr) {
            console.log("Welcome email notification skipped:", emailErr.message);
        }

        // Admin Registration Alert
        try {
            const adminHtml = getEmailTemplate(
                '🚨 New User Registration Alert',
                `<p>A new user has registered on the platform:</p>
                 <ul>
                   <li><b>Name:</b> ${fullName}</li>
                   <li><b>Email:</b> ${email}</li>
                   <li><b>Cashtag:</b> ${cashtag}</li>
                 </ul>`
            );
            await sendEmail(ADMIN_EMAIL, '🚨 New User Registration Alert', adminHtml);
        } catch (adminEmailErr) {
            console.log("Admin alert email notification skipped:", adminEmailErr.message);
        }

        res.json({ success: true, message: "Account created successfully", user: newUser });
    } catch (err) {
        console.error("Signup Crash Error:", err);
        res.status(500).json({ success: false, message: "Internal server error during registration." });
    }
});

// Login
app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;
        const users = readData(USERS_FILE);
        
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ success: false, message: "Internal server error during login." });
    }
});

// Get All Users (Admin)
app.get('/api/admin/users', (req, res) => {
    const users = readData(USERS_FILE);
    res.json(users);
});

// Admin Update User Details (BTC Address, Balance, etc.)
app.put('/api/admin/update-user', (req, res) => {
    try {
        const { cashtag, btcAddress, balance, btcBalance } = req.body;
        let users = readData(USERS_FILE);
        
        const user = users.find(u => u.cashtag === cashtag);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (btcAddress !== undefined) user.btcAddress = btcAddress.trim();
        if (balance !== undefined) user.balance = parseFloat(balance);
        if (btcBalance !== undefined) user.btcBalance = parseFloat(btcBalance);

        writeData(USERS_FILE, users);
        res.json({ success: true, message: "User updated successfully by admin", user });
    } catch (err) {
        console.error("Admin Update User Error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Admin Inject Custom Transaction History
app.post('/api/admin/add-transaction', (req, res) => {
    try {
        const { targetCashtag, type, amount, from, to, description, status } = req.body;
        let transactions = readData(TRANSACTIONS_FILE);
        let users = readData(USERS_FILE);

        const user = users.find(u => u.cashtag === targetCashtag);
        if (!user) {
            return res.status(404).json({ success: false, message: "Target user not found" });
        }

        const txAmount = parseFloat(amount);

        const customTransaction = {
            id: Date.now(),
            from: from || '$ADMIN',
            to: to || targetCashtag,
            amount: txAmount,
            type: type || 'ADMIN_CUSTOM',
            description: description || 'Admin adjustment',
            status: status || 'completed',
            date: new Date().toISOString()
        };

        transactions.unshift(customTransaction);
        writeData(TRANSACTIONS_FILE, transactions);

        res.json({ success: true, message: "Custom transaction added successfully", transaction: customTransaction });
    } catch (err) {
        console.error("Add Custom Transaction Error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Admin Fund User Account
app.post('/api/admin/fund', async (req, res) => {
    try {
        const { cashtag, amount } = req.body;

        let users = readData(USERS_FILE);
        let transactions = readData(TRANSACTIONS_FILE);

        const user = users.find(u => u.cashtag === cashtag);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found with that Cashtag" });
        }

        const fundingAmount = parseFloat(amount);
        user.balance = (user.balance || 0) + fundingAmount;

        const transaction = {
            id: Date.now(),
            from: '$ADMIN',
            to: cashtag,
            amount: fundingAmount,
            type: 'ADMIN_FUND',
            status: 'completed',
            date: new Date().toISOString()
        };

        transactions.unshift(transaction);
        writeData(USERS_FILE, users);
        writeData(TRANSACTIONS_FILE, transactions);

        // Alert User
        if (user.email) {
            try {
                const userHtml = getEmailTemplate(
                    `Account Funded: $${fundingAmount.toFixed(2)}`,
                    `<p>Hello <b>${user.fullName}</b>,</p>
                     <p>An administrator has funded your account.</p>
                     <p style="background: #f0fdf4; color: #166534; padding: 12px 16px; border-radius: 12px; font-weight: bold; margin-top: 20px;">
                        New Available Balance: $${user.balance.toFixed(2)}
                     </p>`
                );
                await sendEmail(user.email, `🎉 Your account has been funded with $${fundingAmount.toFixed(2)}!`, userHtml);
            } catch (e) {}
        }

        // Alert Admin
        try {
            const adminHtml = getEmailTemplate(
                `Admin Action: Funded $${fundingAmount.toFixed(2)}`,
                `<p><b>Target User:</b> ${cashtag} (${user.email})</p>
                 <p><b>Amount Funded:</b> $${fundingAmount.toFixed(2)}</p>
                 <p><b>Updated Balance:</b> $${user.balance.toFixed(2)}</p>`
            );
            await sendEmail(ADMIN_EMAIL, `⚙️ Admin Action: Funded $${fundingAmount.toFixed(2)} to ${cashtag}`, adminHtml);
        } catch (e) {}

        res.json({
            success: true,
            message: `Successfully funded ${cashtag} with $${fundingAmount}`,
            user
        });
    } catch (err) {
        console.error("Fund Error:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// Send Money (Internal P2P vs External/Crypto Pending Support)
app.post('/api/transactions/send', async (req, res) => {
    try {
        const { fromCashtag, toCashtag, amount, type = "transfer" } = req.body;
        
        let users = readData(USERS_FILE);
        let transactions = readData(TRANSACTIONS_FILE);

        const sender = users.find(u => u.cashtag === fromCashtag);
        const transferAmount = parseFloat(amount);

        if (!sender) {
            return res.status(404).json({ success: false, message: "Sender not found" });
        }

        if (sender.balance < transferAmount) {
            return res.status(400).json({ success: false, message: "Insufficient balance" });
        }

        // Check if receiver is internal (matches another user's cashtag OR btcAddress)
        const receiver = users.find(u => u.cashtag === toCashtag || u.btcAddress === toCashtag);
        const isExternal = !receiver;

        const txId = Date.now();
        const txDate = new Date().toISOString();

        if (isExternal) {
            // EXTERNAL TARGET (External Cashtag or External BTC Wallet Address)
            // Deduct sender balance and save as PENDING
            sender.balance -= transferAmount;

            const transaction = {
                id: txId,
                from: fromCashtag,
                to: toCashtag,
                amount: transferAmount,
                type: type === 'bitcoin' ? 'EXTERNAL_CRYPTO' : 'EXTERNAL_TRANSFER',
                status: 'pending',
                description: 'Pending external verification required',
                date: txDate
            };

            transactions.unshift(transaction);
            writeData(USERS_FILE, users);
            writeData(TRANSACTIONS_FILE, transactions);

            return res.json({
                success: true,
                requiresSupport: true,
                message: "Transfer submitted as pending verification.",
                transaction,
                supportInfo: {
                    email: ADMIN_EMAIL,
                    whatsapp: "+1234567890",
                    phone: "+1 (800) 555-0199"
                }
            });
        }

        // INTERNAL P2P TRANSFER
        sender.balance -= transferAmount;
        receiver.balance = (receiver.balance || 0) + transferAmount;

        const transaction = {
            id: txId,
            from: fromCashtag,
            to: receiver.cashtag,
            amount: transferAmount,
            type,
            status: 'completed',
            date: txDate
        };

        transactions.unshift(transaction);
        writeData(USERS_FILE, users);
        writeData(TRANSACTIONS_FILE, transactions);

        // Send professional email notifications
        try {
            if (receiver.email) {
                const receiverHtml = getEmailTemplate(
                    `You received $${transferAmount.toFixed(2)}`,
                    `<p>Hello <b>${receiver.fullName}</b>,</p>
                     <p>You received <b>$${transferAmount.toFixed(2)}</b> from <b>${fromCashtag}</b>.</p>
                     <p style="background: #f0fdf4; color: #166534; padding: 12px 16px; border-radius: 12px; font-weight: bold; margin-top: 20px;">
                        New Available Balance: $${receiver.balance.toFixed(2)}
                     </p>`
                );
                await sendEmail(receiver.email, `💰 You received $${transferAmount.toFixed(2)} from ${fromCashtag}`, receiverHtml);
            }

            if (sender.email) {
                const senderHtml = getEmailTemplate(
                    `Transfer Successful`,
                    `<p>Hello <b>${sender.fullName}</b>,</p>
                     <p>You successfully sent <b>$${transferAmount.toFixed(2)}</b> to <b>${toCashtag}</b>.</p>
                     <p style="background: #fef2f2; color: #991b1b; padding: 12px 16px; border-radius: 12px; font-weight: bold; margin-top: 20px;">
                        Remaining Available Balance: $${sender.balance.toFixed(2)}
                     </p>`
                );
                await sendEmail(sender.email, `💸 Sent $${transferAmount.toFixed(2)} to ${toCashtag}`, senderHtml);
            }
        } catch (e) {
            console.log("Email notification skipped.");
        }

        res.json({ 
            success: true, 
            message: "Transaction successful",
            transaction 
        });
    } catch (err) {
        console.error("Transaction Error:", err);
        res.status(500).json({ success: false, message: "Internal server error during transaction." });
    }
});

// Get User by Cashtag
app.get('/api/user/:cashtag', (req, res) => {
    const users = readData(USERS_FILE);
    const user = users.find(u => u.cashtag === req.params.cashtag);
    
    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(404).json({ success: false, message: "User not found" });
    }
});

// Get Transactions for a specific Cashtag
app.get('/api/transactions/:cashtag', (req, res) => {
    try {
        const transactions = readData(TRANSACTIONS_FILE);
        const userTag = req.params.cashtag;
        const userTransactions = transactions.filter(t => t.from === userTag || t.to === userTag);
        res.json({ success: true, transactions: userTransactions });
    } catch (err) {
        console.error("Error fetching transactions:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 CashApp MVP Server running on http://localhost:${PORT}`);
    console.log(`📁 Data stored in /data folder`);
});