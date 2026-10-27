// public/js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    loadAdminUsers();

    const adminFundForm = document.getElementById('adminFundForm');
    if (adminFundForm) {
        adminFundForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const cashtag = document.getElementById('targetCashtag').value;
            const amount = document.getElementById('fundAmount').value;

            try {
                const response = await fetch('/api/admin/fund', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cashtag, amount })
                });

                const data = await response.json();

                if (data.success) {
                    alert(`Successfully funded ${cashtag} with $${amount}! Emails sent.`);
                    adminFundForm.reset();
                    loadAdminUsers(); // Refresh user table
                } else {
                    alert('Funding failed: ' + data.message);
                }
            } catch (error) {
                console.error('Admin fund error:', error);
                alert('Something went wrong connecting to the server.');
            }
        });
    }
});

// Function to fetch and render all users for the admin
async function loadAdminUsers() {
    const userTableBody = document.getElementById('adminUserTableBody');
    if (!userTableBody) return;

    try {
        const response = await fetch('/api/admin/users');
        const users = await response.json();

        userTableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td><b>${user.cashtag}</b></td>
                <td>$${user.balance ? user.balance.toFixed(2) : '0.00'}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            `;
            userTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading users for admin:', error);
    }
}