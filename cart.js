/**
 * Shopping Cart Module for ArtGalleria
 * Handles cart functionality including adding, removing, and updating items
 */

// Initialize cart module
const cart = (function() {
    // Private variables
    let cartItems = [];
    
    // Load cart from localStorage on initialization
    function init() {
        loadCart();
        updateCartCount();
        
        // Add event listeners for add to cart buttons
        document.addEventListener('DOMContentLoaded', function() {
            // Add event listeners for add to cart buttons
            const addToCartButtons = document.querySelectorAll('.btn-add-cart');
            addToCartButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Get artwork data from parent card
                    const artworkCard = this.closest('.artwork-card');
                    if (!artworkCard) return;
                    
                    const artworkId = this.getAttribute('data-id') || artworkCard.getAttribute('data-id') || Math.floor(Math.random() * 1000);
                    const artworkTitle = artworkCard.querySelector('h3')?.textContent || 'Artwork';
                    const artworkPrice = parseFloat(artworkCard.getAttribute('data-price')) || 0;
                    const artworkImage = artworkCard.querySelector('img')?.src || '';
                    const artistName = artworkCard.querySelector('.artist')?.textContent || 'Unknown Artist';
                    
                    // Create item object
                    const item = {
                        id: artworkId,
                        title: artworkTitle,
                        price: artworkPrice,
                        image: artworkImage,
                        artist: artistName,
                        quantity: 1
                    };
                    
                    // Add to cart
                    addItem(item);
                    
                    // Show success message
                    showMessage(`"${artworkTitle}" added to cart!`, 'success');
                });
            });
            
            // Initialize cart page if we're on it
            if (window.location.pathname.includes('cart.html')) {
                renderCartPage();
            }
        });
    }
    
    // Load cart from localStorage
    function loadCart() {
        const savedCart = localStorage.getItem('artgalleria_cart');
        if (savedCart) {
            try {
                cartItems = JSON.parse(savedCart);
            } catch (e) {
                console.error('Error parsing cart data:', e);
                cartItems = [];
            }
        }
    }
    
    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('artgalleria_cart', JSON.stringify(cartItems));
    }
    
    // Add item to cart
    function addItem(item) {
        // Check if item already exists in cart
        const existingItemIndex = cartItems.findIndex(cartItem => cartItem.id === item.id);
        
        if (existingItemIndex !== -1) {
            // Update quantity if item exists
            cartItems[existingItemIndex].quantity += 1;
        } else {
            // Add new item
            cartItems.push(item);
        }
        
        // Save and update UI
        saveCart();
        updateCartCount();
    }
    
    // Remove item from cart
    function removeItem(itemId) {
        cartItems = cartItems.filter(item => item.id !== itemId);
        saveCart();
        updateCartCount();
        
        // Update cart page if we're on it
        if (window.location.pathname.includes('cart.html')) {
            renderCartPage();
        }
    }
    
    // Update item quantity
    function updateItemQuantity(itemId, quantity) {
        const itemIndex = cartItems.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            // Ensure quantity is at least 1
            const newQuantity = Math.max(1, quantity);
            cartItems[itemIndex].quantity = newQuantity;
            
            saveCart();
            updateCartCount();
            
            // Update cart page if we're on it
            if (window.location.pathname.includes('cart.html')) {
                renderCartPage();
            }
        }
    }
    
    // Clear cart
    function clearCart() {
        cartItems = [];
        saveCart();
        updateCartCount();
        
        // Update cart page if we're on it
        if (window.location.pathname.includes('cart.html')) {
            renderCartPage();
        }
    }
    
    // Get cart total
    function getCartTotal() {
        return cartItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
    
    // Update cart count in header
    function updateCartCount() {
        const cartCountElements = document.querySelectorAll('#cart-count');
        const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
        
        // Update all cart count elements on the page
        cartCountElements.forEach(element => {
            element.textContent = itemCount;
        });
        
        // Also update cart count in localStorage for cross-page consistency
        localStorage.setItem('artgalleria_cart_count', itemCount);
        
        console.log('Cart count updated:', itemCount);
    }
    
    // Render cart page
    function renderCartPage() {
        const cartContainer = document.getElementById('cart-items');
        const cartTotalElement = document.getElementById('cart-total');
        const cartSubtotalElement = document.getElementById('cart-subtotal');
        const cartTaxElement = document.getElementById('cart-tax');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const checkoutButton = document.getElementById('checkout-button');
        
        if (!cartContainer) return;
        
        // Remove all cart items except the header
        const cartHeader = cartContainer.querySelector('.cart-header');
        cartContainer.innerHTML = '';
        if (cartHeader) {
            cartContainer.appendChild(cartHeader);
        }
        
        // Show/hide empty cart message
        if (cartItems.length === 0) {
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            if (checkoutButton) checkoutButton.style.display = 'none';
            if (cartTotalElement) cartTotalElement.textContent = '$0.00';
            if (cartSubtotalElement) cartSubtotalElement.textContent = '$0.00';
            if (cartTaxElement) cartTaxElement.textContent = '$0.00';
            return;
        }
        
        // Hide empty cart message and show checkout button
        if (emptyCartMessage) emptyCartMessage.style.display = 'none';
        if (checkoutButton) checkoutButton.style.display = 'block';
        
        // Render each cart item
        cartItems.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-product">
                    <div class="product-image">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="product-details">
                        <h3>${item.title}</h3>
                        <p class="artist">by ${item.artist}</p>
                    </div>
                </div>
                <div class="cart-price">$${item.price.toFixed(2)}</div>
                <div class="cart-quantity">
                    <div class="quantity-selector">
                        <button class="quantity-btn minus" data-id="${item.id}"><i class="fas fa-minus"></i></button>
                        <input type="number" value="${item.quantity}" min="1" max="10" class="quantity-input" data-id="${item.id}">
                        <button class="quantity-btn plus" data-id="${item.id}"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
                <div class="cart-total">$${(item.price * item.quantity).toFixed(2)}</div>
                <div class="cart-remove">
                    <button class="remove-btn" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            
            cartContainer.appendChild(cartItemElement);
        });
        
        // Calculate totals
        const subtotal = getCartTotal();
        const tax = subtotal * 0.08; // 8% tax rate
        const total = subtotal + tax;
        
        // Update cart totals
        if (cartSubtotalElement) {
            cartSubtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        }
        
        if (cartTaxElement) {
            cartTaxElement.textContent = `$${tax.toFixed(2)}`;
        }
        
        if (cartTotalElement) {
            cartTotalElement.textContent = `$${total.toFixed(2)}`;
        }
        
        // Add event listeners for quantity buttons and remove buttons
        addCartPageEventListeners();
    }
    
    // Add event listeners for cart page
    function addCartPageEventListeners() {
        // Quantity decrease buttons
        const decreaseButtons = document.querySelectorAll('.quantity-btn.minus');
        decreaseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const item = cartItems.find(item => item.id == itemId);
                
                if (item && item.quantity > 1) {
                    updateItemQuantity(itemId, item.quantity - 1);
                }
            });
        });
        
        // Quantity increase buttons
        const increaseButtons = document.querySelectorAll('.quantity-btn.plus');
        increaseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const item = cartItems.find(item => item.id == itemId);
                
                if (item) {
                    updateItemQuantity(itemId, item.quantity + 1);
                }
            });
        });
        
        // Quantity input fields
        const quantityInputs = document.querySelectorAll('.quantity-input');
        quantityInputs.forEach(input => {
            input.addEventListener('change', function() {
                const itemId = this.getAttribute('data-id');
                const newQuantity = parseInt(this.value) || 1;
                
                updateItemQuantity(itemId, newQuantity);
            });
        });
        
        // Remove buttons
        const removeButtons = document.querySelectorAll('.remove-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const item = cartItems.find(item => item.id == itemId);
                
                if (item) {
                    // Show message
                    showMessage(`"${item.title}" removed from cart`, 'info');
                    // Remove item
                    removeItem(itemId);
                }
            });
        });
        
        // Clear cart button
        const clearCartButton = document.getElementById('clear-cart-button');
        if (clearCartButton) {
            clearCartButton.addEventListener('click', function() {
                if (confirm('Are you sure you want to clear your cart?')) {
                    clearCart();
                    showMessage('Cart cleared', 'info');
                }
            });
        }
        
        // Checkout button
        const checkoutButton = document.getElementById('checkout-button');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', function() {
                window.location.href = 'checkout.html';
            });
        }
    }
    
    // Show a message to the user
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
    
    // Public API
    return {
        init: init,
        addItem: addItem,
        removeItem: removeItem,
        updateItemQuantity: updateItemQuantity,
        clearCart: clearCart,
        getCartTotal: getCartTotal,
        getCartItems: function() { return [...cartItems]; }
    };
})();

// Initialize cart
cart.init();
