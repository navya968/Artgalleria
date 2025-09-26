/**
 * Authentication Forms Handler for ArtGalleria
 * Handles login and registration form submissions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize forms if they exist on the page
    initLoginForm();
    initRegisterForm();
    updateUIBasedOnAuth();
    
    // Add logout handler
    const logoutLinks = document.querySelectorAll('.logout-link');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.authService.logout();
            window.location.href = 'index.html';
        });
    });
});

/**
 * Initialize the login form
 */
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Validate form data
        if (!email || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        // Attempt login
        const user = await window.authService.login(email, password);
        
        if (user) {
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect based on user role
            setTimeout(() => {
                if (user.role === 'artist') {
                    window.location.href = 'artist-dashboard.html';
                } else if (user.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1500);
        } else {
            showMessage('Invalid email or password', 'error');
        }
    });
    
    // Toggle password visibility
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const passwordField = this.previousElementSibling;
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });
}

/**
 * Initialize the registration form
 */
function initRegisterForm() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const fullname = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const accountType = document.querySelector('input[name="account-type"]:checked').value;
        const termsChecked = document.getElementById('terms').checked;
        
        // Validate form data
        if (!fullname || !email || !password || !confirmPassword) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }
        
        if (!termsChecked) {
            showMessage('Please agree to the Terms of Service and Privacy Policy', 'error');
            return;
        }
        
        // Create user data object
        const userData = {
            username: fullname.toLowerCase().replace(/\s+/g, '.'),
            fullname: fullname,
            email: email,
            password: password,
            role: accountType,
            profileImage: null,
            createdAt: new Date().toISOString()
        };
        
        // Attempt registration
        const user = await window.authService.register(userData);
        
        if (user) {
            showMessage('Registration successful! Redirecting...', 'success');
            
            // Redirect based on user role
            setTimeout(() => {
                if (user.role === 'artist') {
                    window.location.href = 'artist-dashboard.html';
                } else {
                    window.location.href = 'profile.html';
                }
            }, 1500);
        } else {
            showMessage('Registration failed. Please try again.', 'error');
        }
    });
}

/**
 * Update UI based on authentication status
 */
function updateUIBasedOnAuth() {
    const isLoggedIn = window.authService.isLoggedIn;
    const currentUser = window.authService.getCurrentUser();
    
    // Get all elements that should be shown/hidden based on auth status
    const loggedInElements = document.querySelectorAll('.logged-in-only');
    const loggedOutElements = document.querySelectorAll('.logged-out-only');
    const artistElements = document.querySelectorAll('.artist-only');
    const adminElements = document.querySelectorAll('.admin-only');
    const userNameElements = document.querySelectorAll('.user-name');
    
    // Update visibility based on login status
    loggedInElements.forEach(el => {
        el.style.display = isLoggedIn ? 'block' : 'none';
    });
    
    loggedOutElements.forEach(el => {
        el.style.display = isLoggedIn ? 'none' : 'block';
    });
    
    // Update visibility based on user role
    if (isLoggedIn) {
        artistElements.forEach(el => {
            el.style.display = window.authService.isArtist() ? 'block' : 'none';
        });
        
        adminElements.forEach(el => {
            el.style.display = window.authService.isAdmin() ? 'block' : 'none';
        });
        
        // Update user name elements
        userNameElements.forEach(el => {
            el.textContent = currentUser.fullname || currentUser.username;
        });
    }
}

/**
 * Show a message to the user
 * @param {string} message - The message to show
 * @param {string} type - The type of message (success, error, info)
 */
function showMessage(message, type = 'info') {
    // Check if message container exists, create if not
    let messageContainer = document.querySelector('.message-container');
    
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.className = 'message-container';
        document.body.appendChild(messageContainer);
        
        // Style the message container
        messageContainer.style.position = 'fixed';
        messageContainer.style.top = '20px';
        messageContainer.style.left = '50%';
        messageContainer.style.transform = 'translateX(-50%)';
        messageContainer.style.zIndex = '1000';
        messageContainer.style.width = '80%';
        messageContainer.style.maxWidth = '400px';
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;
    
    // Style the message
    messageElement.style.padding = '15px';
    messageElement.style.marginBottom = '10px';
    messageElement.style.borderRadius = '5px';
    messageElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    messageElement.style.animation = 'fadeIn 0.3s ease-out';
    
    // Set color based on type
    if (type === 'success') {
        messageElement.style.backgroundColor = '#d4edda';
        messageElement.style.color = '#155724';
        messageElement.style.borderLeft = '5px solid #28a745';
    } else if (type === 'error') {
        messageElement.style.backgroundColor = '#f8d7da';
        messageElement.style.color = '#721c24';
        messageElement.style.borderLeft = '5px solid #dc3545';
    } else {
        messageElement.style.backgroundColor = '#cce5ff';
        messageElement.style.color = '#004085';
        messageElement.style.borderLeft = '5px solid #007bff';
    }
    
    // Add message to container
    messageContainer.appendChild(messageElement);
    
    // Remove message after delay
    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transition = 'opacity 0.3s ease-out';
        
        setTimeout(() => {
            messageContainer.removeChild(messageElement);
        }, 300);
    }, 3000);
}

// Add auth event listeners
window.authService.addAuthListener('login', function(event) {
    updateUIBasedOnAuth();
});

window.authService.addAuthListener('logout', function(event) {
    updateUIBasedOnAuth();
});

window.authService.addAuthListener('profileUpdate', function(event) {
    updateUIBasedOnAuth();
});
