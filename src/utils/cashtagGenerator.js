const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../../data/users.json');

/**
 * Cashtag Generator Utility
 * Generates unique $cashtag for users
 */
class CashtagGenerator {

    /**
     * Generate a unique cashtag based on username or name
     */
    static generate(baseName) {
        if (!baseName || typeof baseName !== 'string') {
            throw new Error("Invalid base name for cashtag");
        }

        const cleanName = this.cleanInput(baseName);
        let cashtag = `$${cleanName}`;
        let counter = 1;

        const users = this.getUsers();

        // Ensure uniqueness
        while (this.cashtagExists(cashtag, users)) {
            cashtag = `$${cleanName}${counter}`;
            counter++;
        }

        return cashtag;
    }

    /**
     * Clean input (remove spaces, symbols, lowercase)
     */
    static cleanInput(input) {
        return input
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')   // remove special characters
            .substring(0, 15);           // limit length
    }

    /**
     * Check if cashtag already exists
     */
    static cashtagExists(cashtag, users = null) {
        if (!users) users = this.getUsers();

        return users.some(
            user => user.cashtag.toLowerCase() === cashtag.toLowerCase()
        );
    }

    /**
     * Get all users
     */
    static getUsers() {
        if (!fs.existsSync(USERS_FILE)) return [];

        try {
            return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        } catch (error) {
            console.error("Error reading users:", error);
            return [];
        }
    }
}

module.exports = CashtagGenerator;