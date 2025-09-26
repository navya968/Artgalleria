document.addEventListener('DOMContentLoaded', function() {
    // Gallery Filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    const artworkCards = document.querySelectorAll('.artwork-card');
    
    filterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(function(btn) {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filterValue = this.getAttribute('data-filter');
            
            // Filter artworks
            artworkCards.forEach(function(card) {
                if (filterValue === 'all') {
                    card.style.display = 'block';
                } else {
                    if (card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
    
    // Testimonials Slider
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    let currentSlide = 0;
    
    // Hide all testimonials except the first one
    testimonials.forEach(function(testimonial, index) {
        if (index !== 0) {
            testimonial.style.display = 'none';
        }
    });
    
    // Function to show a specific slide
    function showSlide(n) {
        // Hide all testimonials
        testimonials.forEach(function(testimonial) {
            testimonial.style.display = 'none';
        });
        
        // Remove active class from all dots
        dots.forEach(function(dot) {
            dot.classList.remove('active');
        });
        
        // Show the current testimonial and activate the corresponding dot
        testimonials[n].style.display = 'block';
        dots[n].classList.add('active');
    }
    
    // Function to move to the next slide
    function nextSlide() {
        currentSlide++;
        if (currentSlide >= testimonials.length) {
            currentSlide = 0;
        }
        showSlide(currentSlide);
    }
    
    // Function to move to the previous slide
    function prevSlide() {
        currentSlide--;
        if (currentSlide < 0) {
            currentSlide = testimonials.length - 1;
        }
        showSlide(currentSlide);
    }
    
    // Event listeners for next and previous buttons
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    
    // Event listeners for dots
    dots.forEach(function(dot, index) {
        dot.addEventListener('click', function() {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
    
    // Auto slide every 5 seconds
    setInterval(nextSlide, 5000);
    
    // Follow Button Functionality
    const followBtn = document.querySelector('.follow-btn');
    
    if (followBtn) {
        followBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            
            if (icon.classList.contains('far')) {
                // Change to solid heart and update text
                icon.classList.remove('far');
                icon.classList.add('fas');
                this.innerHTML = '<i class="fas fa-heart"></i> Following';
            } else {
                // Change back to regular heart and update text
                icon.classList.remove('fas');
                icon.classList.add('far');
                this.innerHTML = '<i class="far fa-heart"></i> Follow';
            }
        });
    }
    
    // Like Button Functionality
    const likeBtns = document.querySelectorAll('.like-btn');
    
    likeBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const icon = this.querySelector('i');
            
            if (icon.classList.contains('far')) {
                // Change to solid heart
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = '#ff6b6b';
            } else {
                // Change back to regular heart
                icon.classList.remove('fas');
                icon.classList.add('far');
                icon.style.color = '';
            }
        });
    });
    
    // Add to Cart Button Functionality
    const cartBtns = document.querySelectorAll('.cart-btn');
    
    cartBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get artwork details
            const artworkCard = this.closest('.artwork-card');
            const artworkName = artworkCard.querySelector('h3').textContent;
            
            // Show notification
            const notification = document.createElement('div');
            notification.classList.add('notification');
            notification.innerHTML = `<i class="fas fa-check-circle"></i> ${artworkName} added to cart`;
            
            // Style the notification
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.right = '20px';
            notification.style.backgroundColor = '#4caf50';
            notification.style.color = '#fff';
            notification.style.padding = '15px 20px';
            notification.style.borderRadius = '5px';
            notification.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
            notification.style.display = 'flex';
            notification.style.alignItems = 'center';
            notification.style.gap = '10px';
            notification.style.zIndex = '1000';
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            // Add notification to the body
            document.body.appendChild(notification);
            
            // Show notification with animation
            setTimeout(function() {
                notification.style.opacity = '1';
                notification.style.transform = 'translateY(0)';
            }, 10);
            
            // Remove notification after 3 seconds
            setTimeout(function() {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(20px)';
                
                // Remove from DOM after animation
                setTimeout(function() {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
            
            // Update cart count
            const cartCount = document.getElementById('cart-count');
            if (cartCount) {
                cartCount.textContent = parseInt(cartCount.textContent) + 1;
            }
        });
    });
    
    // View Button Functionality (Quick View Modal)
    const viewBtns = document.querySelectorAll('.view-btn');
    
    viewBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get artwork details
            const artworkCard = this.closest('.artwork-card');
            const artworkImage = artworkCard.querySelector('.artwork-image img').src;
            const artworkName = artworkCard.querySelector('h3').textContent;
            const artworkCategory = artworkCard.querySelector('.artwork-category').textContent;
            const artworkPrice = artworkCard.querySelector('.artwork-price').innerHTML;
            
            // Create modal
            const modal = document.createElement('div');
            modal.classList.add('quick-view-modal');
            
            // Modal content
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <div class="modal-body">
                        <div class="modal-image">
                            <img src="${artworkImage}" alt="${artworkName}">
                        </div>
                        <div class="modal-details">
                            <h2>${artworkName}</h2>
                            <p class="modal-category">${artworkCategory}</p>
                            <div class="modal-price">${artworkPrice}</div>
                            <p class="modal-description">This stunning artwork by Sarah Johnson captures the essence of abstract expressionism with vibrant colors and dynamic composition. Each piece is unique and comes with a certificate of authenticity.</p>
                            <div class="modal-actions">
                                <div class="quantity-selector">
                                    <button class="quantity-btn minus">-</button>
                                    <input type="number" class="quantity-input" value="1" min="1" max="10">
                                    <button class="quantity-btn plus">+</button>
                                </div>
                                <button class="btn btn-primary add-to-cart-btn">Add to Cart</button>
                            </div>
                            <div class="modal-meta">
                                <div class="meta-item">
                                    <span class="meta-label">Size:</span>
                                    <span class="meta-value">24" x 36"</span>
                                </div>
                                <div class="meta-item">
                                    <span class="meta-label">Medium:</span>
                                    <span class="meta-value">Acrylic on Canvas</span>
                                </div>
                                <div class="meta-item">
                                    <span class="meta-label">Year:</span>
                                    <span class="meta-value">2025</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Style the modal
            modal.style.display = 'none';
            modal.style.position = 'fixed';
            modal.style.zIndex = '1001';
            modal.style.left = '0';
            modal.style.top = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.overflow = 'auto';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            
            const modalContent = modal.querySelector('.modal-content');
            modalContent.style.backgroundColor = '#fff';
            modalContent.style.margin = '5% auto';
            modalContent.style.padding = '20px';
            modalContent.style.width = '90%';
            modalContent.style.maxWidth = '1000px';
            modalContent.style.borderRadius = '8px';
            modalContent.style.position = 'relative';
            
            const closeModal = modal.querySelector('.close-modal');
            closeModal.style.position = 'absolute';
            closeModal.style.right = '20px';
            closeModal.style.top = '15px';
            closeModal.style.fontSize = '28px';
            closeModal.style.fontWeight = 'bold';
            closeModal.style.cursor = 'pointer';
            
            const modalBody = modal.querySelector('.modal-body');
            modalBody.style.display = 'flex';
            modalBody.style.flexWrap = 'wrap';
            modalBody.style.gap = '30px';
            
            const modalImage = modal.querySelector('.modal-image');
            modalImage.style.flex = '1';
            modalImage.style.minWidth = '300px';
            
            const modalImg = modal.querySelector('.modal-image img');
            modalImg.style.width = '100%';
            modalImg.style.height = 'auto';
            modalImg.style.borderRadius = '5px';
            
            const modalDetails = modal.querySelector('.modal-details');
            modalDetails.style.flex = '1';
            modalDetails.style.minWidth = '300px';
            
            const modalCategory = modal.querySelector('.modal-category');
            modalCategory.style.color = '#777';
            modalCategory.style.marginBottom = '15px';
            
            const modalPrice = modal.querySelector('.modal-price');
            modalPrice.style.fontSize = '1.5rem';
            modalPrice.style.fontWeight = '600';
            modalPrice.style.color = 'var(--primary-color)';
            modalPrice.style.marginBottom = '20px';
            
            const modalDescription = modal.querySelector('.modal-description');
            modalDescription.style.marginBottom = '25px';
            modalDescription.style.lineHeight = '1.7';
            modalDescription.style.color = '#555';
            
            const modalActions = modal.querySelector('.modal-actions');
            modalActions.style.display = 'flex';
            modalActions.style.gap = '15px';
            modalActions.style.marginBottom = '30px';
            modalActions.style.flexWrap = 'wrap';
            
            const quantitySelector = modal.querySelector('.quantity-selector');
            quantitySelector.style.display = 'flex';
            quantitySelector.style.alignItems = 'center';
            quantitySelector.style.border = '1px solid #ddd';
            quantitySelector.style.borderRadius = '4px';
            
            const quantityBtns = modal.querySelectorAll('.quantity-btn');
            quantityBtns.forEach(function(btn) {
                btn.style.width = '30px';
                btn.style.height = '30px';
                btn.style.background = 'none';
                btn.style.border = 'none';
                btn.style.cursor = 'pointer';
            });
            
            const quantityInput = modal.querySelector('.quantity-input');
            quantityInput.style.width = '40px';
            quantityInput.style.height = '30px';
            quantityInput.style.border = 'none';
            quantityInput.style.borderLeft = '1px solid #ddd';
            quantityInput.style.borderRight = '1px solid #ddd';
            quantityInput.style.textAlign = 'center';
            
            const modalMeta = modal.querySelector('.modal-meta');
            modalMeta.style.marginTop = '30px';
            modalMeta.style.padding = '20px';
            modalMeta.style.backgroundColor = '#f9f9f9';
            modalMeta.style.borderRadius = '5px';
            
            const metaItems = modal.querySelectorAll('.meta-item');
            metaItems.forEach(function(item) {
                item.style.marginBottom = '10px';
                item.style.display = 'flex';
            });
            
            const metaLabels = modal.querySelectorAll('.meta-label');
            metaLabels.forEach(function(label) {
                label.style.fontWeight = '600';
                label.style.width = '80px';
            });
            
            // Add modal to the body
            document.body.appendChild(modal);
            
            // Show modal
            modal.style.display = 'block';
            
            // Close modal when clicking on X
            closeModal.addEventListener('click', function() {
                modal.style.display = 'none';
                // Remove from DOM after closing
                setTimeout(function() {
                    document.body.removeChild(modal);
                }, 300);
            });
            
            // Close modal when clicking outside of it
            window.addEventListener('click', function(event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                    // Remove from DOM after closing
                    setTimeout(function() {
                        document.body.removeChild(modal);
                    }, 300);
                }
            });
            
            // Quantity buttons functionality
            const minusBtn = modal.querySelector('.minus');
            const plusBtn = modal.querySelector('.plus');
            
            minusBtn.addEventListener('click', function() {
                let value = parseInt(quantityInput.value);
                if (value > 1) {
                    value--;
                    quantityInput.value = value;
                }
            });
            
            plusBtn.addEventListener('click', function() {
                let value = parseInt(quantityInput.value);
                if (value < 10) {
                    value++;
                    quantityInput.value = value;
                }
            });
            
            // Add to cart button in modal
            const addToCartBtn = modal.querySelector('.add-to-cart-btn');
            
            addToCartBtn.addEventListener('click', function() {
                const quantity = parseInt(quantityInput.value);
                
                // Show notification
                const notification = document.createElement('div');
                notification.classList.add('notification');
                notification.innerHTML = `<i class="fas fa-check-circle"></i> ${artworkName} (${quantity}) added to cart`;
                
                // Style the notification
                notification.style.position = 'fixed';
                notification.style.bottom = '20px';
                notification.style.right = '20px';
                notification.style.backgroundColor = '#4caf50';
                notification.style.color = '#fff';
                notification.style.padding = '15px 20px';
                notification.style.borderRadius = '5px';
                notification.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
                notification.style.display = 'flex';
                notification.style.alignItems = 'center';
                notification.style.gap = '10px';
                notification.style.zIndex = '1000';
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(20px)';
                notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                
                // Add notification to the body
                document.body.appendChild(notification);
                
                // Show notification with animation
                setTimeout(function() {
                    notification.style.opacity = '1';
                    notification.style.transform = 'translateY(0)';
                }, 10);
                
                // Remove notification after 3 seconds
                setTimeout(function() {
                    notification.style.opacity = '0';
                    notification.style.transform = 'translateY(20px)';
                    
                    // Remove from DOM after animation
                    setTimeout(function() {
                        document.body.removeChild(notification);
                    }, 300);
                }, 3000);
                
                // Update cart count
                const cartCount = document.getElementById('cart-count');
                if (cartCount) {
                    cartCount.textContent = parseInt(cartCount.textContent) + quantity;
                }
                
                // Close modal
                modal.style.display = 'none';
                // Remove from DOM after closing
                setTimeout(function() {
                    document.body.removeChild(modal);
                }, 300);
            });
        });
    });
    
    // Contact Form Validation
    const contactForm = document.querySelector('.contact-form form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form inputs
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const subjectInput = document.getElementById('subject');
            const messageInput = document.getElementById('message');
            
            // Validate inputs
            let isValid = true;
            
            if (!nameInput.value.trim()) {
                highlightError(nameInput);
                isValid = false;
            } else {
                removeError(nameInput);
            }
            
            if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
                highlightError(emailInput);
                isValid = false;
            } else {
                removeError(emailInput);
            }
            
            if (!subjectInput.value.trim()) {
                highlightError(subjectInput);
                isValid = false;
            } else {
                removeError(subjectInput);
            }
            
            if (!messageInput.value.trim()) {
                highlightError(messageInput);
                isValid = false;
            } else {
                removeError(messageInput);
            }
            
            // If form is valid, show success message
            if (isValid) {
                // Create success message
                const successMessage = document.createElement('div');
                successMessage.classList.add('form-success');
                successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Your message has been sent successfully. We will get back to you soon!';
                
                // Style success message
                successMessage.style.backgroundColor = '#4caf50';
                successMessage.style.color = '#fff';
                successMessage.style.padding = '15px';
                successMessage.style.borderRadius = '5px';
                successMessage.style.marginBottom = '20px';
                successMessage.style.display = 'flex';
                successMessage.style.alignItems = 'center';
                successMessage.style.gap = '10px';
                
                // Insert success message before the form
                contactForm.parentNode.insertBefore(successMessage, contactForm);
                
                // Reset form
                contactForm.reset();
                
                // Remove success message after 5 seconds
                setTimeout(function() {
                    successMessage.remove();
                }, 5000);
            }
        });
        
        // Function to highlight error
        function highlightError(input) {
            input.style.borderColor = '#f44336';
        }
        
        // Function to remove error
        function removeError(input) {
            input.style.borderColor = '';
        }
        
        // Function to validate email
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
        
        // Add input event listeners to remove error on input
        const formInputs = contactForm.querySelectorAll('input, textarea');
        
        formInputs.forEach(function(input) {
            input.addEventListener('input', function() {
                removeError(this);
            });
        });
    }
});
