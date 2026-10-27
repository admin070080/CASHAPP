// src/controllers/transactionController.js

const fs = require('fs');
const path = require('path');
const NotificationController = require('./notificationController');

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');

// Helper Functions
const readData = (file) => {
    if (!fs.existsSync(file)) return [];
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
        console.error(`Error reading file:`, error);
        return [];
    }
};

const writeData = (file, data) => {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing file:`, error);
    }
};

class TransactionController {

    /**
     * Send Money via Cashtag (User to User)
     */
    static async sendViaCashtag(req, res) {
        try {
            const { fromCashtag, toCashtag, amount, note = "" } = req.body;

            if (!fromCashtag || !toCashtag || !amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Sender Cashtag, Recipient Cashtag, and valid amount are required"
                });
            }

            let users = readData(USERS_FILE);
            let transactions = readData(TRANSACTIONS_FILE);

            const senderIndex = users.findIndex(u => u.cashtag.toLowerCase() === fromCashtag.toLowerCase());
            const receiverIndex = users.findIndex(u => u.cashtag.toLowerCase() === toCashtag.toLowerCase());

            if (senderIndex === -1) {
                return res.status(404).json({ success: false, message: "Sender not found" });
            }
            if (receiverIndex === -1) {
                return res.status(404).json({ success: false, message: "Recipient not found" });
            }

            const sender = users[senderIndex];
            const receiver = users[receiverIndex];

            if (sender.balance < amount) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient balance"
                });
            }

            // Process the transfer
            sender.balance -= parseFloat(amount);
            receiver.balance = (receiver.balance || 0) + parseFloat(amount);

            const transaction = {
                id: Date.now(),
                type: "transfer",
                from: sender.cashtag,
                to: receiver.cashtag,
                amount: parseFloat(amount),
                note: note.trim(),
                date: new Date().toISOString(),
                status: "completed"
            };

            transactions.unshift(transaction);

            // Save changes
            writeData(USERS_FILE, users);
            writeData(TRANSACTIONS_FILE, transactions);

            // Send Notification to Receiver
            NotificationController.sendTransactionAlert({
                from: sender.cashtag,
                to: receiver.cashtag,
                amount: transaction.amount,
                type: "received"
            });

            console.log(`💸 Transfer successful: ${sender.cashtag} → ${receiver.cashtag} ($${amount})`);

            res.json({
                success: true,
                message: `Successfully sent $${amount} to ${receiver.cashtag}`,
                transaction
            });

        } catch (error) {
            console.error("Send Via Cashtag Error:", error);
            res.status(500).json({
                success: false,
                message: "Transaction failed. Please try again."
            });
        }
    }

    /**
     * Convert USD to Bitcoin
     */
    static async convertToBTC(req, res) {
        try {
            const { cashtag, usdAmount } = req.body;

            if (!cashtag || !usdAmount || usdAmount <= 0) {
                return res.status(400).json({ success: false, message: "Invalid request" });
            }

            let users = readData(USERS_FILE);
            const userIndex = users.findIndex(u => u.cashtag === cashtag);

            if (userIndex === -1) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            if (users[userIndex].balance < usdAmount) {
                return res.status(400).json({ success: false, message: "Insufficient USD balance" });
            }

            // Simulate BTC conversion (1 USD = 0.000015 BTC for demo)
            const btcAmount = parseFloat((usdAmount * 0.000015).toFixed(6));

            users[userIndex].balance -= parseFloat(usdAmount);
            users[userIndex].btcBalance = (users[userIndex].btcBalance || 0) + btcAmount;

            writeData(USERS_FILE, users);

            const transaction = {
                id: Date.now(),
                type: "convert",
                from: "USD",
                to: "BTC",
                amount: usdAmount,
                btcAmount: btcAmount,
                cashtag: cashtag,
                date: new Date().toISOString()
            };

            console.log(`₿ Converted $${usdAmount} to ${btcAmount} BTC for ${cashtag}`);

            res.json({
                success: true,
                message: `Successfully converted $${usdAmount} to ${btcAmount} BTC`,
                transaction
            });

        } catch (error) {
            res.status(500).json({ success: false, message: "Conversion failed" });
        }
    }

    /**
     * Get Transaction History
     */
    static async getHistory(req, res) {
        try {
            const transactions = readData(TRANSACTIONS_FILE);
            res.json({
                success: true,
                count: transactions.length,
                transactions: transactions.slice(0, 50) // Last 50 transactions
            });
        } catch (error) {
            res.status(500).json({ success: false, message: "Failed to fetch history" });
        }
    }
}

module.exports = TransactionController;