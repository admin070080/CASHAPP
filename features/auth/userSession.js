// /features/auth/userSession.js

const userSession = {
    isAuthenticated: false,
    user: null,

    login(user) {
        this.isAuthenticated = true;
        this.user = user;
    },

    logout() {
        this.isAuthenticated = false;
        this.user = null;
    },

    getUser() {
        return this.user;
    },

    isLoggedIn() {
        return this.isAuthenticated;
    },
};

export default userSession;