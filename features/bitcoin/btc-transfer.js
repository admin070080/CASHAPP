const bitcoinService = require('../../services/bitcoinService');
const logger = require('../../utils/logger');

// File: /Users/macbook/Downloads/cashapp-mvp/features/bitcoin/btc-transfer.js


/**
 * Handles Bitcoin transfer functionality
 * @param {string} senderAddress - The Bitcoin address of the sender
 * @param {string} recipientAddress - The Bitcoin address of the recipient
 * @param {number} amount - The amount of Bitcoin to transfer
 * @returns {Promise<Object>} - Transaction details or error message
 */
async function transferBitcoin(senderAddress, recipientAddress, amount) {
    try {
        // Validate input
        if (!senderAddress || !recipientAddress || amount <= 0) {
            throw new Error('Invalid input: Ensure all fields are correctly provided.');
        }

        // Initiate Bitcoin transfer
        const transaction = await bitcoinService.transfer(senderAddress, recipientAddress, amount);

        // Log the transaction
        logger.info(`Bitcoin transfer successful: ${JSON.stringify(transaction)}`);

        return {
            success: true,
            message: 'Transfer completed successfully.',
            transaction,
        };
    } catch (error) {
        logger.error(`Bitcoin transfer failed: ${error.message}`);
        return {
            success: false,
            message: error.message,
        };
    }
}

module.exports = {
    transferBitcoin,
};