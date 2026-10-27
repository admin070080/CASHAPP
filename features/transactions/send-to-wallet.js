const WalletService = require('../../services/walletService');
const TransactionService = require('../../services/transactionService');

// File: /Users/macbook/Downloads/cashapp-mvp/features/transactions/send-to-wallet.js

// Import necessary modules or dependencies

/**
 * Sends funds to a specified wallet.
 * @param {string} senderId - ID of the sender.
 * @param {string} recipientWalletId - ID of the recipient's wallet.
 * @param {number} amount - Amount to send.
 * @returns {Promise<object>} - Transaction details.
 */
async function sendToWallet(senderId, recipientWalletId, amount) {
    try {
        // Validate input
        if (!senderId || !recipientWalletId || !amount || amount <= 0) {
            throw new Error('Invalid input parameters');
        }

        // Check sender's wallet balance
        const senderWallet = await WalletService.getWalletByUserId(senderId);
        if (senderWallet.balance < amount) {
            throw new Error('Insufficient balance');
        }

        // Deduct amount from sender's wallet
        await WalletService.updateWalletBalance(senderWallet.id, -amount);

        // Add amount to recipient's wallet
        await WalletService.updateWalletBalance(recipientWalletId, amount);

        // Record the transaction
        const transaction = await TransactionService.createTransaction({
            senderId,
            recipientWalletId,
            amount,
            type: 'send-to-wallet',
            status: 'completed',
        });

        return transaction;
    } catch (error) {
        console.error('Error in sendToWallet:', error.message);
        throw error;
    }
}

module.exports = sendToWallet;