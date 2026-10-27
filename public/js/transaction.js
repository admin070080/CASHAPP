// public/js/transaction.js

document.addEventListener('DOMContentLoaded', () => {
    const sendMoneyForm = document.getElementById('sendMoneyForm');
    
    if (sendMoneyForm) {
        sendMoneyForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Retrieve current logged-in user from localStorage
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                alert('Please log in first.');
                window.location.href = 'login.html';
                return;
            }

            const recipientCashtag = document.getElementById('recipientCashtag').value.trim();
            const transferAmount = document.getElementById('transferAmount').value;

            try {
                const response = await fetch('/api/transactions/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fromCashtag: currentUser.cashtag,
                        toCashtag: recipientCashtag,
                        amount: parseFloat(transferAmount),
                        type: 'P2P_TRANSFER'
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // Close the modal window
                    const sendModal = document.getElementById('sendModal');
                    if (sendModal) sendModal.classList.add('hidden');

                    // Update local user balance & refresh session
                    currentUser.balance -= parseFloat(transferAmount);
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    
                    sendMoneyForm.reset();

                    if (data.requiresSupport) {
                        // TRIGGER SUPPORT MODAL POPUP FOR EXTERNAL / CRYPTO DESTINATIONS
                        showSupportPopup({
                            title: "Verification Required",
                            message: `Your transfer of $${parseFloat(transferAmount).toFixed(2)} to external destination <b>${recipientCashtag}</b> has been recorded in your history as <b>Pending</b>. To clear and process this transfer, please contact our support team immediately.`,
                            email: data.supportInfo.email,
                            whatsapp: data.supportInfo.whatsapp,
                            phone: data.supportInfo.phone
                        });
                    } else {
                        alert(`Successfully sent $${transferAmount} to ${recipientCashtag}!`);
                        window.location.reload();
                    }
                } else {
                    alert('Transfer failed: ' + data.message);
                }
            } catch (error) {
                console.error('Transaction error:', error);
                alert('Something went wrong connecting to the server.');
            }
        });
    }
});

// Professional Support Popup Modal Generator
function showSupportPopup({ title, message, email, whatsapp, phone }) {
    const existingModal = document.getElementById('support-alert-modal');
    if (existingModal) existingModal.remove();

    const modalHTML = `
        <div id="support-alert-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div style="background: #ffffff; width: 90%; max-width: 420px; border-radius: 20px; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); text-align: center; font-family: sans-serif;">
                <div style="width: 50px; height: 50px; background: #FEF3C7; color: #D97706; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 15px auto;">⚠️</div>
                <h3 style="margin: 0 0 10px 0; font-size: 20px; color: #111827; font-weight: 700;">${title}</h3>
                <p style="color: #4B5563; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">${message}</p>
                
                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                    <a href="mailto:${email}?subject=Pending External Transfer Verification" style="background: #00D632; color: white; padding: 12px; border-radius: 12px; text-decoration: none; font-weight: 600; display: block;">📧 Email Support</a>
                    <a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=Hello,%20I%20have%20a%20pending%20external%20transfer%20that%20requires%20verification." target="_blank" style="background: #25D366; color: white; padding: 12px; border-radius: 12px; text-decoration: none; font-weight: 600; display: block;">💬 WhatsApp Support</a>
                    <a href="tel:${phone}" style="background: #111827; color: white; padding: 12px; border-radius: 12px; text-decoration: none; font-weight: 600; display: block;">📞 Call Support: ${phone}</a>
                </div>

                <button onclick="document.getElementById('support-alert-modal').remove(); window.location.reload();" style="background: #F3F4F6; border: none; color: #374151; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; width: 100%;">Close / View History</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}