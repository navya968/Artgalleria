/**
 * Artist Dashboard Script for ArtGalleria
 * Handles artist dashboard functionality and data display
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is an artist
    if (!window.authService.isLoggedIn || !window.authService.isArtist()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize dashboard
    initDashboard();
});

/**
 * Initialize the artist dashboard
 */
function initDashboard() {
    const currentUser = window.authService.getCurrentUser();
    if (!currentUser) return;
    
    // Update user name in the dropdown
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
        el.textContent = currentUser.fullname || currentUser.username;
    });
    
    // Load artist's artworks
    loadArtworks();
    
    // Add logout functionality
    const logoutLinks = document.querySelectorAll('.logout-link');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.authService.logout();
            window.location.href = 'index.html';
        });
    });
}

/**
 * Load the artist's artworks
 */
async function loadArtworks() {
    const currentUser = window.authService.getCurrentUser();
    if (!currentUser) return;
    
    try {
        // Get artworks data
        const artworksData = await DbService.loadData('artworks');
        const artworks = artworksData.artworks || [];
        
        // Filter artworks by artist ID
        const artistArtworks = artworks.filter(artwork => artwork.artistId === currentUser.id);
        
        // Update artwork count
        const artworkCountElement = document.getElementById('artwork-count');
        if (artworkCountElement) {
            artworkCountElement.textContent = artistArtworks.length;
        }
        
        // Display recent artworks
        displayRecentArtworks(artistArtworks);
    } catch (error) {
        console.error('Error loading artworks:', error);
    }
}

/**
 * Display recent artworks in the dashboard
 * @param {Array} artworks - The artist's artworks
 */
function displayRecentArtworks(artworks) {
    const recentArtworksContainer = document.getElementById('recent-artworks');
    if (!recentArtworksContainer) return;
    
    // Clear container
    recentArtworksContainer.innerHTML = '';
    
    // If no artworks, show empty state
    if (!artworks || artworks.length === 0) {
        recentArtworksContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-palette"></i>
                <p>You haven't uploaded any artworks yet.</p>
                <a href="artist-upload.html" class="btn btn-primary">Upload Your First Artwork</a>
            </div>
        `;
        return;
    }
    
    // Sort artworks by creation date (newest first)
    const sortedArtworks = [...artworks].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    // Display up to 4 recent artworks
    const recentArtworks = sortedArtworks.slice(0, 4);
    
    // Create artwork items
    recentArtworks.forEach(artwork => {
        const artworkItem = document.createElement('div');
        artworkItem.className = 'artwork-item';
        
        artworkItem.innerHTML = `
            <img src="${artwork.image}" alt="${artwork.title}">
            <div class="artwork-info">
                <h4>${artwork.title}</h4>
                <p>${artwork.price ? '$' + artwork.price : 'Not for sale'}</p>
            </div>
        `;
        
        recentArtworksContainer.appendChild(artworkItem);
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
