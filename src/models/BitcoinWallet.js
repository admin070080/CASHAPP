// src/models/BitcoinWallet.js

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

/**
 * Bitcoin Wallet Model
 */
class BitcoinWallet {

    /**
     * Convert USD to Bitcoin
     */
    static convertToBTC(cashtag, usdAmount) {
        if (!cashtag || usdAmount <= 0) {
            throw new Error("Invalid cashtag or amount");
        }

        let users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.cashtag.toLowerCase() === cashtag.toLowerCase());

        if (userIndex === -1) {
            throw new Error("User not found");
        }

        const user = users[userIndex];

        if (user.balance < usdAmount) {
            throw new Error("Insufficient USD balance");
        }

        // Current simulated BTC rate (demo purpose)
        const BTC_RATE = 0.000015; // 1 USD ≈ 0.000015 BTC
        const btcAmount = parseFloat((usdAmount * BTC_RATE).toFixed(8));

        // Update balances
        user.balance -= parseFloat(usdAmount);
        user.btcBalance = (user.btcBalance || 0) + btcAmount;

        this.saveUsers(users);

        return {
            success: true,
            usdAmount: parseFloat(usdAmount),
            btcAmount: btcAmount,
            newUSD: user.balance,
            newBTC: user.btcBalance,
            rate: BTC_RATE,
            message: `Successfully converted $${usdAmount} to ${btcAmount} BTC`
        };
    }

    /**
     * Send Bitcoin to External Wallet Address
     */
    static sendBTC(cashtag, walletAddress, btcAmount) {
        if (!cashtag || !walletAddress || btcAmount <= 0) {
            throw new Error("Missing required fields");
        }

        let users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.cashtag.toLowerCase() === cashtag.toLowerCase());

        if (userIndex === -1) {
            throw new Error("User not found");
        }

        const user = users[userIndex];

        if ((user.btcBalance || 0) < btcAmount) {
            throw new Error("Insufficient BTC balance");
        }

        // Deduct BTC
        user.btcBalance = parseFloat((user.btcBalance - btcAmount).toFixed(8));

        this.saveUsers(users);

        const transaction = {
            id: Date.now(),
            type: "btc_send",
            from: cashtag,
            to: walletAddress,
            amountBTC: btcAmount,
            date: new Date().toISOString(),
            status: "pending", // In real app, this would be 'completed' after blockchain confirmation
            note: "External BTC Transfer"
        };

        this.logTransaction(transaction);

        console.log(`₿ Sent ${btcAmount} BTC from ${cashtag} to ${walletAddress}`);

        return {
            success: true,
            message: `Sent ${btcAmount} BTC to ${walletAddress}`,
            transaction
        };
    }

    /**
     * Get User's Bitcoin Balance
     */
    static getBalance(cashtag) {
        const users = this.getAllUsers();
        const user = users.find(u => u.cashtag.toLowerCase() === cashtag.toLowerCase());

        if (!user) throw new Error("User not found");

        return {
            cashtag: user.cashtag,
            usdBalance: user.balance || 0,
            btcBalance: user.btcBalance || 0
        };
    }

    // ==================== Private Helpers ====================

    static getAllUsers() {
        if (!fs.existsSync(USERS_FILE)) return [];
        try {
            return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        } catch (e) {
            return [];
        }
    }

    static saveUsers(users) {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    }

    static logTransaction(tx) {
        const txFile = path.join(DATA_DIR, 'transactions.json');
        let transactions = [];

        if (fs.existsSync(txFile)) {
            try {
                transactions = JSON.parse(fs.readFileSync(txFile, 'utf8'));
            } catch (e) {}
        }

        transactions.unshift(tx);
        fs.writeFileSync(txFile, JSON.stringify(transactions, null, 2));
    }
}

module.exports = BitcoinWallet;