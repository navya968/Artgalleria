/**
 * Profile Page Script for ArtGalleria
 * Handles profile page functionality and data display
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!window.authService.isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize profile page
    initProfilePage();
    
    // Initialize tab functionality
    initTabs();
});

/**
 * Initialize the profile page with user data
 */
function initProfilePage() {
    const currentUser = window.authService.getCurrentUser();
    if (!currentUser) return;
    
    // Update profile information
    document.getElementById('profile-name').textContent = currentUser.fullname || currentUser.username;
    document.getElementById('profile-email').textContent = currentUser.email;
    
    // Format and display member since date
    const memberSince = new Date(currentUser.createdAt);
    const options = { year: 'numeric', month: 'long' };
    document.getElementById('member-since').textContent = memberSince.toLocaleDateString('en-US', options);
    
    // Show/hide artist badge
    const artistBadge = document.getElementById('artist-badge');
    if (artistBadge) {
        artistBadge.style.display = currentUser.role === 'artist' ? 'inline-flex' : 'none';
    }
    
    // Show/hide artist-only tabs
    const artistTabs = document.querySelectorAll('.artist-only');
    artistTabs.forEach(tab => {
        tab.style.display = currentUser.role === 'artist' ? 'block' : 'none';
    });
    
    // Set profile image if available
    if (currentUser.profileImage) {
        document.getElementById('profile-image').src = currentUser.profileImage;
    }
    
    // Initialize profile image upload
    initProfileImageUpload();
    
    // Initialize forms
    initChangePasswordForm();
    initNotificationForm();
    initDeleteAccountButton();
}

/**
 * Initialize tab functionality
 */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding tab pane
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

/**
 * Initialize profile image upload
 */
function initProfileImageUpload() {
    const profileImageUpload = document.getElementById('profile-image-upload');
    if (!profileImageUpload) return;
    
    profileImageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Check file type
        if (!file.type.match('image.*')) {
            showMessage('Please select an image file', 'error');
            return;
        }
        
        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showMessage('Image size should be less than 2MB', 'error');
            return;
        }
        
        // Read and display the image
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile-image').src = e.target.result;
            
            // Update user profile image in localStorage
            const currentUser = window.authService.getCurrentUser();
            if (currentUser) {
                currentUser.profileImage = e.target.result;
                window.authService.updateProfile(currentUser);
                showMessage('Profile image updated successfully', 'success');
            }
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Initialize change password form
 */
function initChangePasswordForm() {
    const changePasswordForm = document.getElementById('change-password-form');
    if (!changePasswordForm) return;
    
    changePasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;
        
        // Validate form data
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            showMessage('New passwords do not match', 'error');
            return;
        }
        
        // Verify current password
        const currentUser = window.authService.getCurrentUser();
        if (currentUser && currentUser.password === currentPassword) {
            // Update password
            currentUser.password = newPassword;
            window.authService.updateProfile(currentUser);
            
            showMessage('Password updated successfully', 'success');
            changePasswordForm.reset();
        } else {
            showMessage('Current password is incorrect', 'error');
        }
    });
}

/**
 * Initialize notification preferences form
 */
function initNotificationForm() {
    const notificationForm = document.getElementById('notification-form');
    if (!notificationForm) return;
    
    notificationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const emailOrders = document.getElementById('email-orders').checked;
        const emailPromotions = document.getElementById('email-promotions').checked;
        const emailNewsletter = document.getElementById('email-newsletter').checked;
        
        // Update user preferences
        const currentUser = window.authService.getCurrentUser();
        if (currentUser) {
            // Create preferences object if it doesn't exist
            if (!currentUser.preferences) {
                currentUser.preferences = {};
            }
            
            // Update preferences
            currentUser.preferences.emailOrders = emailOrders;
            currentUser.preferences.emailPromotions = emailPromotions;
            currentUser.preferences.emailNewsletter = emailNewsletter;
            
            // Save updated user data
            window.authService.updateProfile(currentUser);
            
            showMessage('Notification preferences saved', 'success');
        }
    });
}

/**
 * Initialize delete account button
 */
function initDeleteAccountButton() {
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    if (!deleteAccountBtn) return;
    
    deleteAccountBtn.addEventListener('click', function() {
        const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
        
        if (confirmed) {
            const success = window.authService.deleteAccount();
            
            if (success) {
                showMessage('Account deleted successfully. Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showMessage('Failed to delete account. Please try again.', 'error');
            }
        }
    });
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
