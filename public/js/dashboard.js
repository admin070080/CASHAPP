// public/js/dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
    const rawUser = localStorage.getItem('currentUser');

    if (!rawUser) {
        window.location.href = 'login.html';
        return;
    }

    let currentUser;
    try {
        currentUser = JSON.parse(rawUser);
    } catch (e) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
        return;
    }

    // Populate Dashboard UI & Load History
    updateUI(currentUser);
    if (currentUser.cashtag) {
        loadUserTransactions(currentUser.cashtag);
    }

    // Fetch fresh user data from server
    if (currentUser.cashtag) {
        try {
            const response = await fetch(`/api/user/${encodeURIComponent(currentUser.cashtag)}`);
            const data = await response.json();

            if (data.success && data.user) {
                currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                updateUI(currentUser);
                loadUserTransactions(currentUser.cashtag);
            }
        } catch (error) {
            console.error('Failed to sync profile from server:', error);
        }
    }

    // Logout Action
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }

    // Request Money Action
    const requestForm = document.getElementById('requestMoneyForm');
    if (requestForm) {
        requestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const tag = document.getElementById('reqCashtag').value;
            const amt = document.getElementById('reqAmount').value;
            alert(`Payment request of $${amt} sent to ${tag}!`);
            closeModal('requestModal');
            requestForm.reset();
        });
    }

    // Convert USD to BTC Action with Live Price Check
    const convertForm = document.getElementById('convertBtcForm');
    if (convertForm) {
        convertForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usdAmount = parseFloat(document.getElementById('convertAmount').value);
            const user = JSON.parse(localStorage.getItem('currentUser'));

            if (user.balance < usdAmount) {
                alert('Insufficient USD balance!');
                return;
            }

            // Fetch live BTC price from CoinGecko API with fallback
            let btcRate = 60000; // Fallback default rate if offline
            try {
                const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
                const priceData = await priceRes.json();
                if (priceData && priceData.bitcoin && priceData.bitcoin.usd) {
                    btcRate = priceData.bitcoin.usd;
                }
            } catch (err) {
                console.warn('Could not fetch live BTC price, using fallback rate:', err);
            }

            const btcGained = usdAmount / btcRate;

            user.balance -= usdAmount;
            user.btcBalance = (user.btcBalance || 0) + btcGained;

            localStorage.setItem('currentUser', JSON.stringify(user));
            updateUI(user);
            
            alert(`Live Rate: $${btcRate.toLocaleString()}\nSuccessfully converted $${usdAmount.toFixed(2)} into ${btcGained.toFixed(8)} BTC!`);
            closeModal('btcModal');
            convertForm.reset();
        });
    }

    // Send BTC Action
    const sendBtcForm = document.getElementById('sendBtcForm');
    if (sendBtcForm) {
        sendBtcForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const addr = document.getElementById('btcAddress').value;
            const amt = parseFloat(document.getElementById('btcSatoshi').value);
            const user = JSON.parse(localStorage.getItem('currentUser'));

            if ((user.btcBalance || 0) < amt) {
                alert('Insufficient BTC balance!');
                return;
            }

            user.btcBalance -= amt;
            localStorage.setItem('currentUser', JSON.stringify(user));
            updateUI(user);
            alert(`Successfully sent ${amt.toFixed(8)} BTC to ${addr}`);
            closeModal('sendBtcModal');
            sendBtcForm.reset();
        });
    }
});

function updateUI(user) {
    const nameEl = document.getElementById('user-name');
    const avatarEl = document.getElementById('user-avatar');
    const cashtagEl = document.getElementById('user-cashtag');
    const displayCashtagEl = document.getElementById('display-cashtag');
    const balanceEl = document.getElementById('balance');
    const btcBalanceEl = document.getElementById('btc-balance');
    const qrCashtagEl = document.getElementById('qrCashtag');
    const btcAddressDisplay = document.getElementById('userBtcAddressDisplay');

    if (nameEl) nameEl.textContent = user.fullName || 'User';
    if (avatarEl && user.fullName) avatarEl.textContent = user.fullName.charAt(0).toUpperCase();

    const tag = user.cashtag || '$cashtag';
    if (cashtagEl) cashtagEl.textContent = tag;
    if (displayCashtagEl) displayCashtagEl.textContent = tag;
    if (qrCashtagEl) qrCashtagEl.textContent = tag;

    const usdBalance = user.balance !== undefined ? user.balance : 50.00;
    if (balanceEl) balanceEl.textContent = `$${parseFloat(usdBalance).toFixed(2)}`;

    const btcBalance = user.btcBalance !== undefined ? user.btcBalance : 0.00000000;
    if (btcBalanceEl) btcBalanceEl.textContent = `${parseFloat(btcBalance).toFixed(8)} BTC`;

    // Populate user's unique Bitcoin wallet address for the Receive modal
    if (btcAddressDisplay && user.btcAddress) {
        btcAddressDisplay.textContent = user.btcAddress;
    }
}

// Function to fetch and render user's recent transactions
async function loadUserTransactions(cashtag) {
    try {
        const response = await fetch(`/api/transactions/${encodeURIComponent(cashtag)}`);
        const data = await response.json();
        const container = document.getElementById('recent-activity');
        
        if (!container) return;

        if (data.success && data.transactions && data.transactions.length > 0) {
            container.innerHTML = data.transactions.map(t => {
                const isSender = t.from === cashtag;
                const sign = isSender ? '-' : '+';
                const color = isSender ? 'text-red-600' : 'text-green-600';
                const title = t.type === 'ADMIN_FUND' ? 'Admin Funding' : 
                            (isSender ? `Sent to ${t.to}` : `Received from ${t.from}`);
                
                return `
                    <div class="flex justify-between items-center border-b pb-3 last:border-none">
                        <div>
                            <p class="font-semibold text-gray-800">${title}</p>
                            <p class="text-xs text-gray-400">${new Date(t.date).toLocaleDateString()} ${new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <span class="font-bold ${color} text-lg">${sign}$${parseFloat(t.amount).toFixed(2)}</span>
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = `<p class="text-gray-500 text-sm">No recent transactions yet.</p>`;
        }
    } catch (e) {
        console.error("Failed to load transactions", e);
    }
}