/**
 * Authentication Service for ArtGalleria
 * Handles user registration, login, and session management
 */

class AuthService {
    /**
     * Initialize the authentication service
     */
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        
        // Check if user is already logged in
        this.checkLoginStatus();
    }
    
    /**
     * Check if user is logged in
     * @returns {boolean} - Whether the user is logged in
     */
    checkLoginStatus() {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            this.currentUser = JSON.parse(userJson);
            this.isLoggedIn = true;
            return true;
        }
        return false;
    }
    
    /**
     * Register a new user
     * @param {Object} userData - The user registration data
     * @returns {Promise<Object|null>} - The registered user or null if registration failed
     */
    async register(userData) {
        try {
            // Check if required fields are provided
            if (!userData.username || !userData.email || !userData.password) {
                throw new Error('Username, email, and password are required');
            }
            
            // Check if user already exists
            const existingUser = await DbService.getUserByEmail(userData.email) || 
                                await DbService.getUserByUsername(userData.username);
            
            if (existingUser) {
                throw new Error('User with this email or username already exists');
            }
            
            // Create new user
            const newUser = await DbService.createUser(userData);
            
            if (!newUser) {
                throw new Error('Failed to create user');
            }
            
            // Automatically log in the new user
            return this.login(userData.email, userData.password);
        } catch (error) {
            console.error('Registration error:', error);
            return null;
        }
    }
    
    /**
     * Log in a user
     * @param {string} email - The user email
     * @param {string} password - The user password
     * @returns {Promise<Object|null>} - The logged in user or null if login failed
     */
    async login(email, password) {
        try {
            const user = await DbService.authenticateUser(email, password);
            
            if (!user) {
                throw new Error('Invalid email or password');
            }
            
            // Store user in local storage
            const userToStore = { ...user };
            delete userToStore.password; // Don't store password in local storage
            
            localStorage.setItem('currentUser', JSON.stringify(userToStore));
            
            // Update auth service state
            this.currentUser = userToStore;
            this.isLoggedIn = true;
            
            // Dispatch login event
            this.dispatchAuthEvent('login', userToStore);
            
            return userToStore;
        } catch (error) {
            console.error('Login error:', error);
            return null;
        }
    }
    
    /**
     * Log out the current user
     */
    logout() {
        // Remove user from local storage
        localStorage.removeItem('currentUser');
        
        // Update auth service state
        this.currentUser = null;
        this.isLoggedIn = false;
        
        // Dispatch logout event
        this.dispatchAuthEvent('logout');
    }
    
    /**
     * Get the current user
     * @returns {Object|null} - The current user or null if not logged in
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * Check if the current user is an artist
     * @returns {boolean} - Whether the current user is an artist
     */
    isArtist() {
        return this.currentUser && this.currentUser.role === 'artist';
    }
    
    /**
     * Check if the current user is an admin
     * @returns {boolean} - Whether the current user is an admin
     */
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }
    
    /**
     * Update the current user's profile
     * @param {Object} userData - The updated user data
     * @returns {Promise<Object|null>} - The updated user or null if update failed
     */
    async updateProfile(userData) {
        try {
            if (!this.isLoggedIn) {
                throw new Error('User not logged in');
            }
            
            const updatedUser = await DbService.updateUser(this.currentUser.id, userData);
            
            if (!updatedUser) {
                throw new Error('Failed to update user profile');
            }
            
            // Update local storage and auth service state
            const userToStore = { ...updatedUser };
            delete userToStore.password; // Don't store password in local storage
            
            localStorage.setItem('currentUser', JSON.stringify(userToStore));
            this.currentUser = userToStore;
            
            // Dispatch profile update event
            this.dispatchAuthEvent('profileUpdate', userToStore);
            
            return userToStore;
        } catch (error) {
            console.error('Profile update error:', error);
            return null;
        }
    }
    
    /**
     * Change the current user's password
     * @param {string} currentPassword - The current password
     * @param {string} newPassword - The new password
     * @returns {Promise<boolean>} - Whether the password change was successful
     */
    async changePassword(currentPassword, newPassword) {
        try {
            if (!this.isLoggedIn) {
                throw new Error('User not logged in');
            }
            
            // Verify current password
            const user = await DbService.getUserById(this.currentUser.id);
            
            if (!user || user.password !== currentPassword) {
                throw new Error('Current password is incorrect');
            }
            
            // Update password
            const success = await DbService.updateUser(this.currentUser.id, { password: newPassword });
            
            return success ? true : false;
        } catch (error) {
            console.error('Password change error:', error);
            return false;
        }
    }
    
    /**
     * Delete the current user's account
     * @returns {Promise<boolean>} - Whether the account deletion was successful
     */
    async deleteAccount() {
        try {
            if (!this.isLoggedIn) {
                throw new Error('User not logged in');
            }
            
            // Delete user from database
            const success = await DbService.deleteUser(this.currentUser.id);
            
            if (success) {
                // Log out the user
                this.logout();
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Account deletion error:', error);
            return false;
        }
    }
    
    /**
     * Dispatch an authentication event
     * @param {string} eventType - The type of event (login, logout, profileUpdate)
     * @param {Object} data - The event data
     */
    dispatchAuthEvent(eventType, data = null) {
        const event = new CustomEvent('auth:' + eventType, { detail: data });
        document.dispatchEvent(event);
    }
    
    /**
     * Add an authentication event listener
     * @param {string} eventType - The type of event to listen for (login, logout, profileUpdate)
     * @param {Function} callback - The callback function
     */
    addAuthListener(eventType, callback) {
        document.addEventListener('auth:' + eventType, callback);
    }
    
    /**
     * Remove an authentication event listener
     * @param {string} eventType - The type of event to stop listening for
     * @param {Function} callback - The callback function to remove
     */
    removeAuthListener(eventType, callback) {
        document.removeEventListener('auth:' + eventType, callback);
    }
}

// Create a global instance of the AuthService
window.authService = new AuthService();
