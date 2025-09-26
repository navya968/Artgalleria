/**
 * Authentication Test Script for ArtGalleria
 * This script helps test the login and registration functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add test buttons to the page
    addTestButtons();
    
    // Display current authentication state
    displayAuthState();
});

/**
 * Add test buttons to the page
 */
function addTestButtons() {
    // Create test container
    const testContainer = document.createElement('div');
    testContainer.className = 'auth-test-container';
    testContainer.style.position = 'fixed';
    testContainer.style.bottom = '20px';
    testContainer.style.right = '20px';
    testContainer.style.backgroundColor = '#f8f9fa';
    testContainer.style.padding = '15px';
    testContainer.style.borderRadius = '5px';
    testContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    testContainer.style.zIndex = '9999';
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Auth Test Panel';
    title.style.marginTop = '0';
    title.style.marginBottom = '10px';
    testContainer.appendChild(title);
    
    // Add state display
    const stateDisplay = document.createElement('div');
    stateDisplay.id = 'auth-state-display';
    stateDisplay.style.marginBottom = '10px';
    stateDisplay.style.padding = '10px';
    stateDisplay.style.backgroundColor = '#e9ecef';
    stateDisplay.style.borderRadius = '3px';
    testContainer.appendChild(stateDisplay);
    
    // Add test buttons
    const createTestUserBtn = createButton('Create Test User', createTestUser);
    const loginTestUserBtn = createButton('Login Test User', loginTestUser);
    const logoutBtn = createButton('Logout', logout);
    const clearDataBtn = createButton('Clear All Data', clearAllData);
    
    testContainer.appendChild(createTestUserBtn);
    testContainer.appendChild(loginTestUserBtn);
    testContainer.appendChild(logoutBtn);
    testContainer.appendChild(clearDataBtn);
    
    // Add to document
    document.body.appendChild(testContainer);
}

/**
 * Create a button element
 * @param {string} text - Button text
 * @param {Function} clickHandler - Click event handler
 * @returns {HTMLButtonElement} - The button element
 */
function createButton(text, clickHandler) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.display = 'block';
    button.style.width = '100%';
    button.style.padding = '8px 12px';
    button.style.marginBottom = '8px';
    button.style.backgroundColor = '#007bff';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '3px';
    button.style.cursor = 'pointer';
    
    button.addEventListener('click', clickHandler);
    
    return button;
}

/**
 * Display the current authentication state
 */
function displayAuthState() {
    const stateDisplay = document.getElementById('auth-state-display');
    if (!stateDisplay) return;
    
    const isLoggedIn = window.authService.isLoggedIn;
    const currentUser = window.authService.getCurrentUser();
    
    if (isLoggedIn && currentUser) {
        stateDisplay.innerHTML = `
            <strong>Status:</strong> Logged In<br>
            <strong>User:</strong> ${currentUser.fullname || currentUser.username}<br>
            <strong>Email:</strong> ${currentUser.email}<br>
            <strong>Role:</strong> ${currentUser.role}
        `;
        stateDisplay.style.color = '#155724';
    } else {
        stateDisplay.innerHTML = `
            <strong>Status:</strong> Logged Out<br>
            <strong>User:</strong> None
        `;
        stateDisplay.style.color = '#721c24';
    }
}

/**
 * Create a test user
 */
async function createTestUser() {
    const userData = {
        username: 'testuser',
        fullname: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'buyer',
        profileImage: null,
        createdAt: new Date().toISOString()
    };
    
    try {
        const user = await window.authService.register(userData);
        if (user) {
            showMessage('Test user created successfully!', 'success');
            displayAuthState();
        } else {
            showMessage('Failed to create test user. User might already exist.', 'error');
        }
    } catch (error) {
        showMessage(`Error: ${error.message}`, 'error');
    }
}

/**
 * Login with the test user
 */
async function loginTestUser() {
    try {
        const user = await window.authService.login('test@example.com', 'password123');
        if (user) {
            showMessage('Test user logged in successfully!', 'success');
            displayAuthState();
        } else {
            showMessage('Failed to login test user.', 'error');
        }
    } catch (error) {
        showMessage(`Error: ${error.message}`, 'error');
    }
}

/**
 * Logout the current user
 */
function logout() {
    window.authService.logout();
    showMessage('Logged out successfully!', 'success');
    displayAuthState();
}

/**
 * Clear all localStorage data
 */
function clearAllData() {
    localStorage.clear();
    showMessage('All data cleared!', 'success');
    displayAuthState();
    setTimeout(() => {
        window.location.reload();
    }, 1000);
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
    displayAuthState();
});

window.authService.addAuthListener('logout', function(event) {
    displayAuthState();
});

window.authService.addAuthListener('profileUpdate', function(event) {
    displayAuthState();
});
