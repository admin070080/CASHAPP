// src/utils/balanceManager.js

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

/**
 * Balance Manager Utility
 * Handles all balance-related operations safely
 */
class BalanceManager {

    /**
     * Add money to a user's balance (e.g., Admin deposit, received payment)
     */
    static addBalance(cashtag, amount, source = "system") {
        if (amount <= 0) throw new Error("Amount must be greater than zero");

        let users = this.getUsers();
        const userIndex = users.findIndex(u => u.cashtag.toLowerCase() === cashtag.toLowerCase());

        if (userIndex === -1) {
            throw new Error(`User with cashtag ${cashtag} not found`);
        }

        const previousBalance = users[userIndex].balance || 0;
        users[userIndex].balance = parseFloat((previousBalance + amount).toFixed(2));

        this.saveUsers(users);

        console.log(`💰 Added $${amount} to ${cashtag} (Source: ${source})`);

        return {
            success: true,
            cashtag,
            previousBalance,
            newBalance: users[userIndex].balance,
            added: amount
        };
    }

    /**
     * Deduct money from a user's balance
     */
    static deductBalance(cashtag, amount, reason = "transfer") {
        if (amount <= 0) throw new Error("Amount must be greater than zero");

        let users = this.getUsers();
        const userIndex = users.findIndex(u => u.cashtag.toLowerCase() === cashtag.toLowerCase());

        if (userIndex === -1) {
            throw new Error(`User with cashtag ${cashtag} not found`);
        }

        const currentBalance = users[userIndex].balance || 0;

        if (currentBalance < amount) {
            throw new Error("Insufficient balance");
        }

        users[userIndex].balance = parseFloat((currentBalance - amount).toFixed(2));

        this.saveUsers(users);

        console.log(`💸 Deducted $${amount} from ${cashtag} (${reason})`);

        return {
            success: true,
            cashtag,
            previousBalance: currentBalance,
            newBalance: users[userIndex].balance,
            deducted: amount
        };
    }

    /**
     * Get user's current balance
     */
    static getBalance(cashtag) {
        const users = this.getUsers();
        const user = users.find(u => u.cashtag.toLowerCase() === cashtag.toLowerCase());

        if (!user) throw new Error("User not found");

        return {
            cashtag: user.cashtag,
            usdBalance: parseFloat(user.balance || 0),
            btcBalance: parseFloat(user.btcBalance || 0)
        };
    }

    /**
     * Check if user has sufficient balance
     */
    static hasSufficientBalance(cashtag, amount) {
        try {
            const balance = this.getBalance(cashtag);
            return balance.usdBalance >= amount;
        } catch (error) {
            return false;
        }
    }

    // ======================== Private Helpers ========================

    static getUsers() {
        if (!fs.existsSync(USERS_FILE)) return [];
        try {
            return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        } catch (error) {
            console.error("Error reading users:", error);
            return [];
        }
    }

    static saveUsers(users) {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    }
}

module.exports = BalanceManager;