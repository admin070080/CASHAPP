// public/js/user.js

class User {

    /**
     * Get currently logged in user
     */
    static getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    /**
     * Update user profile
     */
    static updateProfile(updatedData) {
        let currentUser = this.getCurrentUser();
        if (!currentUser) return false;

        let allUsers = JSON.parse(localStorage.getItem('cashapp_users')) || [];

        const userIndex = allUsers.findIndex(u => u.id === currentUser.id);

        if (userIndex !== -1) {
            allUsers[userIndex] = { ...allUsers[userIndex], ...updatedData };
            localStorage.setItem('cashapp_users', JSON.stringify(allUsers));
            
            // Update current session
            localStorage.setItem('currentUser', JSON.stringify(allUsers[userIndex]));
            
            console.log("✅ Profile updated successfully");
            return true;
        }
        return false;
    }

    /**
     * Get user by Cashtag
     */
    static getUserByCashtag(cashtag) {
        const users = JSON.parse(localStorage.getItem('cashapp_users')) || [];
        return users.find(user => 
            user.cashtag.toLowerCase() === cashtag.toLowerCase()
        );
    }

    /**
     * Search users
     */
    static searchUsers(query) {
        const users = JSON.parse(localStorage.getItem('cashapp_users')) || [];
        query = query.toLowerCase().trim();

        return users.filter(user => 
            user.fullName.toLowerCase().includes(query) || 
            user.cashtag.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
    }

    /**
     * Get all users (for directory / admin)
     */
    static getAllUsers() {
        return JSON.parse(localStorage.getItem('cashapp_users')) || [];
    }

    /**
     * Update user balance (mainly for admin use)
     */
    static updateBalance(cashtag, newBalance) {
        let users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.cashtag.toLowerCase() === cashtag.toLowerCase());

        if (userIndex !== -1) {
            users[userIndex].balance = parseFloat(newBalance);
            localStorage.setItem('cashapp_users', JSON.stringify(users));
            return true;
        }
        return false;
    }

    /**
     * Logout user
     */
    static logout() {
        if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('currentUser');
            window.location.href = "login.html";
        }
    }

    /**
     * Check if user is logged in
     */
    static isLoggedIn() {
        return !!this.getCurrentUser();
    }

    /**
     * Refresh current user data from storage
     */
    static refreshCurrentUser() {
        const current = this.getCurrentUser();
        if (!current) return null;

        const users = this.getAllUsers();
        const updatedUser = users.find(u => u.id === current.id);

        if (updatedUser) {
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            return updatedUser;
        }
        return current;
    }
}

// Make available globally
window.User = User;

// Auto-check login status on page load (for protected pages)
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname === '/' ||
        window.location.pathname.endsWith('.html')) {
        
        const currentUser = User.getCurrentUser();
        
        if (!currentUser && !window.location.pathname.includes('login.html') && 
            !window.location.pathname.includes('signup.html')) {
            
            // Redirect to login if trying to access protected page
            window.location.href = "login.html";
        }
    }
});