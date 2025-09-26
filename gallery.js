/**
 * Gallery Page Script for ArtGalleria
 * Handles artwork filtering, search, and display functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize auth service
    if (window.authService) {
        // Update UI based on login status
        updateUIForAuthStatus();
        
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
    
    // Initialize gallery functionality
    initGallery();
    
    // Add "Add to Cart" functionality to artwork cards
    initAddToCartButtons();
});

/**
 * Update UI elements based on authentication status
 */
function updateUIForAuthStatus() {
    if (!window.authService) return;
    
    const isLoggedIn = window.authService.isLoggedIn();
    const currentUser = window.authService.getCurrentUser();
    
    // Elements to show/hide based on login status
    const loggedInOnlyElements = document.querySelectorAll('.logged-in-only');
    const loggedOutOnlyElements = document.querySelectorAll('.logged-out-only');
    const artistOnlyElements = document.querySelectorAll('.artist-only');
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    
    // Update visibility based on login status
    loggedInOnlyElements.forEach(el => {
        el.style.display = isLoggedIn ? 'block' : 'none';
    });
    
    loggedOutOnlyElements.forEach(el => {
        el.style.display = isLoggedIn ? 'none' : 'block';
    });
    
    // If user is logged in, update user-specific elements
    if (isLoggedIn && currentUser) {
        // Update user name in dropdown
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            el.textContent = currentUser.fullname || currentUser.username;
        });
        
        // Show/hide artist-only elements
        const isArtist = currentUser.role === 'artist';
        artistOnlyElements.forEach(el => {
            el.style.display = isArtist ? 'block' : 'none';
        });
        
        // Show/hide admin-only elements
        const isAdmin = currentUser.role === 'admin';
        adminOnlyElements.forEach(el => {
            el.style.display = isAdmin ? 'block' : 'none';
        });
    }
}

/**
 * Initialize gallery functionality
 */
function initGallery() {
    // Get filter elements
    const searchInput = document.getElementById('search-artwork');
    const categoryFilter = document.getElementById('category-filter');
    const styleFilter = document.getElementById('style-filter');
    const priceFilter = document.getElementById('price-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    // Get artwork elements
    const artworkCards = document.querySelectorAll('.artwork-card');
    
    // Add event listeners to filters
    if (searchInput) {
        searchInput.addEventListener('input', filterArtworks);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterArtworks);
    }
    
    if (styleFilter) {
        styleFilter.addEventListener('change', filterArtworks);
    }
    
    if (priceFilter) {
        priceFilter.addEventListener('change', filterArtworks);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', sortArtworks);
    }
    
    // Add titles to artwork cards if missing
    artworkCards.forEach(card => {
        // Check if card has artwork-info section
        let infoSection = card.querySelector('.artwork-info');
        if (!infoSection) {
            // Get image alt text for title
            const img = card.querySelector('img');
            const title = img ? img.alt : 'Artwork';
            
            // Create info section
            infoSection = document.createElement('div');
            infoSection.className = 'artwork-info';
            
            // Add title
            const titleElement = document.createElement('h3');
            titleElement.className = 'artwork-title';
            titleElement.textContent = title;
            infoSection.appendChild(titleElement);
            
            // Add artist (placeholder)
            const artistElement = document.createElement('p');
            artistElement.className = 'artwork-artist';
            artistElement.textContent = 'Artist Name';
            infoSection.appendChild(artistElement);
            
            // Add price
            const price = card.getAttribute('data-price') || '0';
            const priceElement = document.createElement('p');
            priceElement.className = 'artwork-price';
            priceElement.textContent = `$${price}`;
            infoSection.appendChild(priceElement);
            
            // Add to card
            card.appendChild(infoSection);
        }
    });
}

/**
 * Filter artworks based on search and filter criteria
 */
function filterArtworks() {
    // Get filter values
    const searchValue = document.getElementById('search-artwork')?.value.toLowerCase() || '';
    const categoryValue = document.getElementById('category-filter')?.value || 'all';
    const styleValue = document.getElementById('style-filter')?.value || 'all';
    const priceValue = document.getElementById('price-filter')?.value || 'all';
    
    // Get all artwork cards
    const artworkCards = document.querySelectorAll('.artwork-card');
    
    // Filter cards
    artworkCards.forEach(card => {
        // Get card data
        const title = card.querySelector('.artwork-title')?.textContent.toLowerCase() || '';
        const artist = card.querySelector('.artwork-artist')?.textContent.toLowerCase() || '';
        const category = card.getAttribute('data-category') || '';
        const style = card.getAttribute('data-style') || '';
        const price = parseInt(card.getAttribute('data-price') || '0');
        
        // Check if card matches search
        const matchesSearch = searchValue === '' || 
                             title.includes(searchValue) || 
                             artist.includes(searchValue);
        
        // Check if card matches category filter
        const matchesCategory = categoryValue === 'all' || category === categoryValue;
        
        // Check if card matches style filter
        const matchesStyle = styleValue === 'all' || style === styleValue;
        
        // Check if card matches price filter
        let matchesPrice = true;
        if (priceValue !== 'all') {
            if (priceValue === 'under-100' && price >= 100) matchesPrice = false;
            if (priceValue === '100-500' && (price < 100 || price > 500)) matchesPrice = false;
            if (priceValue === '500-1000' && (price < 500 || price > 1000)) matchesPrice = false;
            if (priceValue === 'over-1000' && price <= 1000) matchesPrice = false;
        }
        
        // Show/hide card based on filters
        if (matchesSearch && matchesCategory && matchesStyle && matchesPrice) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Sort artworks based on sort criteria
 */
function sortArtworks() {
    const sortValue = document.getElementById('sort-filter')?.value || 'featured';
    const artworkGrid = document.querySelector('.artwork-grid');
    
    if (!artworkGrid) return;
    
    // Get all artwork cards as array for sorting
    const artworkCards = Array.from(document.querySelectorAll('.artwork-card'));
    
    // Sort cards based on criteria
    artworkCards.sort((a, b) => {
        if (sortValue === 'price-low') {
            const priceA = parseInt(a.getAttribute('data-price') || '0');
            const priceB = parseInt(b.getAttribute('data-price') || '0');
            return priceA - priceB;
        } else if (sortValue === 'price-high') {
            const priceA = parseInt(a.getAttribute('data-price') || '0');
            const priceB = parseInt(b.getAttribute('data-price') || '0');
            return priceB - priceA;
        } else if (sortValue === 'newest') {
            const dateA = new Date(a.getAttribute('data-date') || '2000-01-01');
            const dateB = new Date(b.getAttribute('data-date') || '2000-01-01');
            return dateB - dateA;
        } else if (sortValue === 'oldest') {
            const dateA = new Date(a.getAttribute('data-date') || '2000-01-01');
            const dateB = new Date(b.getAttribute('data-date') || '2000-01-01');
            return dateA - dateB;
        }
        
        // Default: featured (no sorting)
        return 0;
    });
    
    // Remove all cards from grid
    artworkGrid.innerHTML = '';
    
    // Add sorted cards back to grid
    artworkCards.forEach(card => {
        artworkGrid.appendChild(card);
    });
}

/**
 * Initialize "Add to Cart" buttons on artwork cards
 */
function initAddToCartButtons() {
    // Add "Add to Cart" buttons to artwork cards if missing
    const artworkCards = document.querySelectorAll('.artwork-card');
    
    artworkCards.forEach(card => {
        // Check if card already has an "Add to Cart" button
        const hasAddToCartButton = card.querySelector('.btn-add-cart');
        
        if (!hasAddToCartButton) {
            // Get overlay element or create one
            let overlay = card.querySelector('.artwork-overlay');
            
            if (!overlay) {
                // Create overlay
                overlay = document.createElement('div');
                overlay.className = 'artwork-overlay';
                
                // Get image container
                const imageContainer = card.querySelector('.artwork-image');
                if (imageContainer) {
                    imageContainer.appendChild(overlay);
                } else {
                    // If no image container, add overlay directly to card
                    card.appendChild(overlay);
                }
            }
            
            // Check if card has a view details button
            const viewDetailsButton = overlay.querySelector('.btn-view');
            
            // Create "Add to Cart" button
            const addToCartButton = document.createElement('a');
            addToCartButton.href = '#';
            addToCartButton.className = 'btn btn-add-cart';
            addToCartButton.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
            
            // Add button to overlay
            overlay.appendChild(addToCartButton);
            
            // Add click event to button
            addToCartButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get artwork data
                const artworkId = card.getAttribute('data-id') || Math.floor(Math.random() * 1000);
                const artworkTitle = card.querySelector('h3')?.textContent || 'Artwork';
                const artworkPrice = parseFloat(card.getAttribute('data-price')) || 0;
                const artworkImage = card.querySelector('img')?.src || '';
                const artistName = card.querySelector('.artist')?.textContent || 'Unknown Artist';
                
                // Create item object
                const item = {
                    id: artworkId,
                    title: artworkTitle,
                    price: artworkPrice,
                    image: artworkImage,
                    artist: artistName,
                    quantity: 1
                };
                
                // Add to cart using cart module
                if (window.cart && typeof window.cart.addItem === 'function') {
                    window.cart.addItem(item);
                    
                    // Show success message
                    showMessage(`"${artworkTitle}" added to cart!`, 'success');
                } else {
                    console.error('Cart module not available');
                    showMessage('Could not add to cart. Cart module not available.', 'error');
                }
            });
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
