// src/routes/transactionRoutes.js

const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const NotificationController = require('../controllers/notificationController');

// ======================== TRANSACTION ROUTES ========================

// Send Money via Cashtag
router.post('/send', async (req, res) => {
    await TransactionController.sendViaCashtag(req, res);
});

// Convert USD to Bitcoin
router.post('/convert-to-btc', async (req, res) => {
    await TransactionController.convertToBTC(req, res);
});

// Send Bitcoin to External Wallet
router.post('/send-btc', async (req, res) => {
    try {
        const { cashtag, walletAddress, btcAmount } = req.body;

        // You can call BitcoinWallet model here
        const BitcoinWallet = require('../models/BitcoinWallet');
        
        const result = BitcoinWallet.sendBTC(cashtag, walletAddress, btcAmount);
        
        // Send notification
        NotificationController.sendTransactionAlert({
            from: cashtag,
            to: walletAddress,
            amount: btcAmount,
            type: "btc_sent"
        });

        res.json(result);

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Get Transaction History for a User
router.get('/history/:cashtag', async (req, res) => {
    await TransactionController.getHistory(req, res);
});

// Get Recent Transactions (Limited)
router.get('/recent', (req, res) => {
    const transactions = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../../data/transactions.json'), 'utf8') || '[]'
    );
    
    res.json({
        success: true,
        transactions: transactions.slice(0, 20)
    });
});

// Get Transaction by ID
router.get('/:transactionId', (req, res) => {
    const transactions = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../../data/transactions.json'), 'utf8') || '[]'
    );
    
    const transaction = transactions.find(t => t.id === parseInt(req.params.transactionId));
    
    if (transaction) {
        res.json({ success: true, transaction });
    } else {
        res.status(404).json({ success: false, message: "Transaction not found" });
    }
});

module.exports = router;