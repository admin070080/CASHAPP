const { sendMoney } = require('../../services/transactionService');
const { validateCashtag, validateAmount } = require('../../utils/validators');

// File: send-via-cashtag.js


/**
 * Sends money to a user via their Cashtag.
 * @param {string} cashtag - The recipient's Cashtag.
 * @param {number} amount - The amount to send.
 * @returns {Promise<object>} - Transaction details or an error.
 */
async function sendViaCashtag(cashtag, amount) {
    try {
        // Validate inputs
        if (!validateCashtag(cashtag)) {
            throw new Error('Invalid Cashtag format.');
        }

        if (!validateAmount(amount)) {
            throw new Error('Invalid amount. Must be a positive number.');
        }

        // Process transaction
        const transaction = await sendMoney(cashtag, amount);
        return {
            success: true,
            transaction,
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
        };
    }
}

module.exports = sendViaCashtag;