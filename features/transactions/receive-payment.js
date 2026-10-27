const { processPayment } = require('../../utils/paymentProcessor');
const { logTransaction } = require('../../utils/logger');
const { validatePaymentDetails } = require('../../utils/validator');

// File: /Users/macbook/Downloads/cashapp-mvp/features/transactions/receive-payment.js

// Import necessary modules or utilities

// Function to handle receiving a payment
async function receivePayment(paymentDetails) {
    try {
        // Validate payment details
        const isValid = validatePaymentDetails(paymentDetails);
        if (!isValid) {
            throw new Error('Invalid payment details');
        }

        // Process the payment
        const paymentResult = await processPayment(paymentDetails);

        // Log the transaction
        await logTransaction({
            type: 'RECEIVE_PAYMENT',
            details: paymentDetails,
            result: paymentResult,
        });

        // Return the result
        return {
            success: true,
            message: 'Payment received successfully',
            data: paymentResult,
        };
    } catch (error) {
        // Handle errors
        console.error('Error receiving payment:', error.message);
        return {
            success: false,
            message: error.message,
        };
    }
}

// Export the function for use in other parts of the application
module.exports = {
    receivePayment,
};