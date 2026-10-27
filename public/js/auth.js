// public/js/auth.js

let redirectTimeout = null;

// Helper function to trigger pop-up modal notification
function showModal({ accepted, title, message, redirect = false }) {
    const modal = document.getElementById('statusModal');
    const modalBox = document.getElementById('modalBox');
    const iconContainer = document.getElementById('modalIconContainer');
    const icon = document.getElementById('modalIcon');
    const titleEl = document.getElementById('modalTitle');
    const messageEl = document.getElementById('modalMessage');
    const btn = document.getElementById('modalBtn');

    if (!modal) {
        // Fallback in case statusModal elements are missing from HTML
        alert(`${title}: ${message.replace(/<[^>]*>?/gm, '')}`);
        if (redirect) window.location.href = 'index.html';
        return;
    }

    if (accepted) {
        // ACCEPTED STYLING (Green Theme)
        iconContainer.className = "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl bg-green-100 text-green-600";
        icon.className = "fas fa-check-circle";
        btn.className = "w-full py-3.5 rounded-2xl font-semibold text-white bg-green-600 hover:bg-green-700 transition shadow-md cursor-pointer";
        btn.textContent = "Go to Dashboard";
    } else {
        // DECLINED STYLING (Red Theme)
        iconContainer.className = "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl bg-red-100 text-red-600";
        icon.className = "fas fa-times-circle";
        btn.className = "w-full py-3.5 rounded-2xl font-semibold text-white bg-red-600 hover:bg-red-700 transition shadow-md cursor-pointer";
        btn.textContent = "Try Again";
    }

    titleEl.textContent = title;
    messageEl.innerHTML = message;

    // Show modal with animation
    modal.classList.remove('hidden');
    setTimeout(() => {
        modalBox.classList.remove('scale-95', 'opacity-0');
        modalBox.classList.add('scale-100', 'opacity-100');
    }, 10);

    // Auto-redirect on success after 3 seconds
    if (redirect) {
        redirectTimeout = setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
}

function closeNotificationModal() {
    const modal = document.getElementById('statusModal');
    const modalBox = document.getElementById('modalBox');

    if (redirectTimeout) clearTimeout(redirectTimeout);

    if (modalBox) {
        modalBox.classList.remove('scale-100', 'opacity-100');
        modalBox.classList.add('scale-95', 'opacity-0');
    }

    setTimeout(() => {
        if (modal) modal.classList.add('hidden');
        // Proceed to dashboard if current user session exists
        if (localStorage.getItem('currentUser')) {
            window.location.href = 'index.html';
        }
    }, 200);
}

// Handle Signup Form Submission
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const cashtagInput = document.getElementById('cashtag');
        const cashtag = cashtagInput ? cashtagInput.value : '';
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, phone, cashtag, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));

                showModal({
                    accepted: true,
                    title: "Registration Accepted!",
                    message: `<p class="font-medium">Welcome, <b>${data.user.fullName}</b>!</p>
                              <p>Your unique Cashtag is: <span class="text-green-600 font-bold">${data.user.cashtag}</span></p>
                              <p class="text-xs text-gray-500 mt-2">🎉 $50.00 welcome bonus added to your balance.</p>`,
                    redirect: true
                });
            } else {
                showModal({
                    accepted: false,
                    title: "Registration Declined",
                    message: `<p>${data.message || 'Unable to create account with provided information.'}</p>`
                });
            }
        } catch (error) {
            console.error('Signup error:', error);
            showModal({
                accepted: false,
                title: "Connection Failed",
                message: "<p>Unable to connect to authentication server. Please check your connection.</p>"
            });
        }
    });
}

// Handle Login Form Submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                window.location.href = 'index.html';
            } else {
                showModal({
                    accepted: false,
                    title: "Login Declined",
                    message: `<p>${data.message || 'Invalid email or password.'}</p>`
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            showModal({
                accepted: false,
                title: "Connection Failed",
                message: "<p>Unable to connect to authentication server.</p>"
            });
        }
    });
}