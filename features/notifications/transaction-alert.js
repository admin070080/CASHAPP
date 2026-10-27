const sendNotification = require('../../utils/notification-service');
const { getUserPreferences } = require('../../services/user-preferences');
const { formatCurrency } = require('../../utils/currency-formatter');

// File: /Users/macbook/Downloads/cashapp-mvp/features/notifications/transaction-alert.js

// Import necessary modules or dependencies

/**
 * Sends a transaction alert notification to the user.
 * @param {Object} transaction - The transaction details.
 * @param {string} transaction.userId - The ID of the user.
 * @param {number} transaction.amount - The transaction amount.
 * @param {string} transaction.type - The transaction type (e.g., 'credit', 'debit').
 * @param {string} transaction.description - A brief description of the transaction.
 */
async function sendTransactionAlert(transaction) {
    try {
        const userPreferences = await getUserPreferences(transaction.userId);

        if (userPreferences.notificationsEnabled) {
            const formattedAmount = formatCurrency(transaction.amount);
            const message = `Your account was ${transaction.type === 'credit' ? 'credited' : 'debited'} with ${formattedAmount}. Description: ${transaction.description}.`;

            await sendNotification(transaction.userId, message);
            console.log('Transaction alert sent successfully.');
        } else {
            console.log('Notifications are disabled for this user.');
        }
    } catch (error) {
        console.error('Failed to send transaction alert:', error.message);
    }
}

module.exports = sendTransactionAlert;