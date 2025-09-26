document.addEventListener('DOMContentLoaded', function() {
    // Get all form sections
    const shippingForm = document.getElementById('shipping-form');
    const paymentForm = document.getElementById('payment-form');
    const reviewForm = document.getElementById('review-form');
    const confirmationForm = document.getElementById('confirmation-form');
    
    // Get navigation buttons
    const toPaymentBtn = document.getElementById('to-payment-btn');
    const backToShippingBtn = document.getElementById('back-to-shipping-btn');
    const toReviewBtn = document.getElementById('to-review-btn');
    const backToPaymentBtn = document.getElementById('back-to-payment-btn');
    const placeOrderBtn = document.getElementById('place-order-btn');
    
    // Get progress steps
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLines = document.querySelectorAll('.progress-line');
    
    // Get edit buttons
    const editBtns = document.querySelectorAll('.edit-btn');
    
    // Get payment tabs
    const paymentTabs = document.querySelectorAll('.payment-tab');
    const paymentContents = document.querySelectorAll('.payment-tab-content');
    
    // Get shipping options
    const shippingOptions = document.querySelectorAll('input[name="shipping-method"]');
    const shippingCostElement = document.getElementById('shipping-cost');
    
    // Initialize shipping cost
    updateShippingCost();
    
    // Navigation: Shipping to Payment
    toPaymentBtn.addEventListener('click', function() {
        // Here you would normally validate the shipping form
        // For demo purposes, we'll just proceed
        shippingForm.classList.add('hidden');
        paymentForm.classList.remove('hidden');
        
        // Update progress
        updateProgress(1);
    });
    
    // Navigation: Payment to Shipping
    backToShippingBtn.addEventListener('click', function() {
        paymentForm.classList.add('hidden');
        shippingForm.classList.remove('hidden');
        
        // Update progress
        updateProgress(0);
    });
    
    // Navigation: Payment to Review
    toReviewBtn.addEventListener('click', function() {
        // Here you would normally validate the payment form
        // For demo purposes, we'll just proceed
        paymentForm.classList.add('hidden');
        reviewForm.classList.remove('hidden');
        
        // Update progress
        updateProgress(2);
    });
    
    // Navigation: Review to Payment
    backToPaymentBtn.addEventListener('click', function() {
        reviewForm.classList.add('hidden');
        paymentForm.classList.remove('hidden');
        
        // Update progress
        updateProgress(1);
    });
    
    // Navigation: Review to Confirmation
    placeOrderBtn.addEventListener('click', function() {
        // Here you would normally validate the review form and submit the order
        // For demo purposes, we'll just proceed
        reviewForm.classList.add('hidden');
        confirmationForm.classList.remove('hidden');
        
        // Update progress
        updateProgress(3);
    });
    
    // Edit buttons functionality
    editBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            
            if (section === 'shipping') {
                reviewForm.classList.add('hidden');
                shippingForm.classList.remove('hidden');
                updateProgress(0);
            } else if (section === 'payment') {
                reviewForm.classList.add('hidden');
                paymentForm.classList.remove('hidden');
                updateProgress(1);
            } else if (section === 'cart') {
                // Redirect to cart page
                window.location.href = 'cart.html';
            }
        });
    });
    
    // Payment tabs functionality
    paymentTabs.forEach(function(tab, index) {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            paymentTabs.forEach(t => t.classList.remove('active'));
            paymentContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            paymentContents[index].classList.add('active');
        });
    });
    
    // Shipping options functionality
    shippingOptions.forEach(function(option) {
        option.addEventListener('change', updateShippingCost);
    });
    
    // Function to update progress
    function updateProgress(step) {
        progressSteps.forEach(function(progressStep, index) {
            if (index < step) {
                progressStep.classList.add('completed');
                progressStep.classList.remove('active');
            } else if (index === step) {
                progressStep.classList.add('active');
                progressStep.classList.remove('completed');
            } else {
                progressStep.classList.remove('active');
                progressStep.classList.remove('completed');
            }
        });
        
        progressLines.forEach(function(line, index) {
            if (index < step) {
                line.classList.add('active');
            } else {
                line.classList.remove('active');
            }
        });
    }
    
    // Function to update shipping cost
    function updateShippingCost() {
        const selectedShipping = document.querySelector('input[name="shipping-method"]:checked');
        let cost = '$15.00'; // Default cost
        
        if (selectedShipping) {
            const value = selectedShipping.value;
            
            if (value === 'standard') {
                cost = '$15.00';
            } else if (value === 'express') {
                cost = '$35.00';
            } else if (value === 'next-day') {
                cost = '$50.00';
            }
        }
        
        if (shippingCostElement) {
            shippingCostElement.textContent = cost;
        }
    }
    
    // Form field validation (basic example)
    const formInputs = document.querySelectorAll('input[required], select[required]');
    
    formInputs.forEach(function(input) {
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.style.borderColor = '#f44336';
            } else {
                this.style.borderColor = '';
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value) {
                this.style.borderColor = '';
            }
        });
    });
    
    // Credit card input formatting
    const cardNumberInput = document.getElementById('card-number');
    const expiryDateInput = document.getElementById('expiry-date');
    const cvvInput = document.getElementById('cvv');
    
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            let formattedValue = '';
            
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            
            e.target.value = formattedValue.slice(0, 19); // Limit to 16 digits + 3 spaces
        });
    }
    
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            let formattedValue = '';
            
            if (value.length > 0) {
                formattedValue = value.slice(0, 2);
                
                if (value.length > 2) {
                    formattedValue += '/' + value.slice(2, 4);
                }
            }
            
            e.target.value = formattedValue;
        });
    }
    
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            e.target.value = value.slice(0, 3);
        });
    }
    
    // Tooltip for CVV help
    const cvvHelp = document.querySelector('.cvv-help');
    
    if (cvvHelp) {
        cvvHelp.addEventListener('mouseover', function() {
            const tooltip = document.createElement('div');
            tooltip.classList.add('cvv-tooltip');
            tooltip.textContent = 'The 3-digit security code on the back of your card';
            tooltip.style.position = 'absolute';
            tooltip.style.backgroundColor = '#333';
            tooltip.style.color = '#fff';
            tooltip.style.padding = '5px 10px';
            tooltip.style.borderRadius = '3px';
            tooltip.style.fontSize = '0.8rem';
            tooltip.style.zIndex = '100';
            tooltip.style.width = '200px';
            tooltip.style.top = '-40px';
            tooltip.style.left = '-100px';
            
            this.appendChild(tooltip);
        });
        
        cvvHelp.addEventListener('mouseout', function() {
            const tooltip = document.querySelector('.cvv-tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    }
    
    // Different billing address checkbox
    const differentBillingCheck = document.getElementById('different-billing');
    
    if (differentBillingCheck) {
        differentBillingCheck.addEventListener('change', function() {
            if (this.checked) {
                // Here you would normally show billing address fields
                // For demo purposes, we'll just log a message
                console.log('Show billing address fields');
            } else {
                console.log('Hide billing address fields');
            }
        });
    }
    
    // Coupon code application
    const couponForm = document.querySelector('.coupon-form button');
    
    if (couponForm) {
        couponForm.addEventListener('click', function() {
            const couponInput = document.querySelector('.coupon-input');
            const couponCode = couponInput.value.trim();
            
            if (couponCode) {
                // Here you would normally validate the coupon code with the server
                // For demo purposes, we'll just show a success message
                alert('Coupon applied successfully!');
                couponInput.value = '';
            } else {
                alert('Please enter a coupon code');
            }
        });
    }
});
