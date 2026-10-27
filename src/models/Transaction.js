// public/js/transaction.js

class Transaction {

    /**
     * Send money via Cashtag
     */
    static async sendViaCashtag(fromCashtag, toCashtag, amount, note = "") {
        if (!toCashtag || !amount || amount <= 0) {
            alert("Please enter a valid cashtag and amount");
            return false;
        }

        // Simulate API call delay
        const loading = alert("Processing transaction...");

        return new Promise((resolve) => {
            setTimeout(() => {
                let users = JSON.parse(localStorage.getItem('cashapp_users')) || [];
                
                const senderIndex = users.findIndex(u => u.cashtag.toLowerCase() === fromCashtag.toLowerCase());
                const receiverIndex = users.findIndex(u => u.cashtag.toLowerCase() === toCashtag.toLowerCase());

                if (senderIndex === -1) {
                    alert("Sender account not found.");
                    return resolve(false);
                }
                if (receiverIndex === -1) {
                    alert("Recipient not found. Please check the cashtag.");
                    return resolve(false);
                }

                const sender = users[senderIndex];
                const receiver = users[receiverIndex];

                if (sender.balance < amount) {
                    alert("Insufficient balance!");
                    return resolve(false);
                }

                // Execute transaction
                sender.balance -= parseFloat(amount);
                receiver.balance = (receiver.balance || 0) + parseFloat(amount);

                // Save updated users
                localStorage.setItem('cashapp_users', JSON.stringify(users));

                // Create transaction record
                const transaction = {
                    id: Date.now(),
                    type: "sent",
                    from: sender.cashtag,
                    to: receiver.cashtag,
                    amount: parseFloat(amount),
                    note: note,
                    date: new Date().toISOString(),
                    status: "completed"
                };

                this.saveTransaction(transaction);

                // Trigger notification
                if (typeof sendTransactionNotification === 'function') {
                    sendTransactionNotification(sender.cashtag, receiver.cashtag, amount, "sent");
                }

                alert(`✅ Successfully sent $${parseFloat(amount).toFixed(2)} to ${receiver.cashtag}`);
                resolve(true);

            }, 1200);
        });
    }

    /**
     * Save transaction to localStorage
     */
    static saveTransaction(transaction) {
        let transactions = JSON.parse(localStorage.getItem('cashapp_transactions')) || [];
        transactions.unshift(transaction);
        localStorage.setItem('cashapp_transactions', JSON.stringify(transactions));
    }

    /**
     * Get all transactions for current user
     */
    static getUserTransactions(cashtag) {
        const allTransactions = JSON.parse(localStorage.getItem('cashapp_transactions')) || [];
        return allTransactions.filter(tx => 
            tx.from === cashtag || tx.to === cashtag
        );
    }

    /**
     * Convert USD to Bitcoin
     */
    static convertToBTC(cashtag, usdAmount) {
        if (usdAmount <= 0) return { success: false, message: "Invalid amount" };

        let users = JSON.parse(localStorage.getItem('cashapp_users')) || [];
        const userIndex = users.findIndex(u => u.cashtag === cashtag);

        if (userIndex === -1) return { success: false, message: "User not found" };
        if (users[userIndex].balance < usdAmount) {
            return { success: false, message: "Insufficient balance" };
        }

        const btcRate = 0.000015; // Demo rate
        const btcAmount = parseFloat((usdAmount * btcRate).toFixed(8));

        users[userIndex].balance -= parseFloat(usdAmount);
        users[userIndex].btcBalance = (users[userIndex].btcBalance || 0) + btcAmount;

        localStorage.setItem('cashapp_users', JSON.stringify(users));

        return {
            success: true,
            usdAmount: parseFloat(usdAmount),
            btcAmount: btcAmount,
            message: `Successfully converted $${usdAmount} to ${btcAmount} BTC`
        };
    }

    /**
     * Send Bitcoin to Wallet Address
     */
    static sendToWallet(cashtag, walletAddress, btcAmount) {
        if (!walletAddress || btcAmount <= 0) {
            return { success: false, message: "Invalid wallet address or amount" };
        }

        let users = JSON.parse(localStorage.getItem('cashapp_users')) || [];
        const userIndex = users.findIndex(u => u.cashtag === cashtag);

        if (userIndex === -1) return { success: false, message: "User not found" };

        const user = users[userIndex];
        if ((user.btcBalance || 0) < btcAmount) {
            return { success: false, message: "Insufficient BTC balance" };
        }

        user.btcBalance = parseFloat((user.btcBalance - btcAmount).toFixed(8));
        localStorage.setItem('cashapp_users', JSON.stringify(users));

        console.log(`₿ Sent ${btcAmount} BTC to ${walletAddress}`);

        return {
            success: true,
            message: `Successfully sent ${btcAmount} BTC to external wallet`,
            walletAddress
        };
    }
}

// Make it available globally
window.Transaction = Transaction;