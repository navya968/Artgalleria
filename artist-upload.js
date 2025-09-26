/**
 * Artist Upload Module for ArtGalleria
 * Handles artwork upload functionality for artists
 */

class ArtistUploadModule {
    /**
     * Initialize the artist upload module
     */
    constructor() {
        this.form = document.getElementById('artwork-upload-form');
        this.imageInput = document.getElementById('artwork-images');
        this.imagePreview = document.getElementById('image-preview');
        this.artworksContainer = document.getElementById('artist-artworks');
        
        // Initialize the module
        this.init();
    }
    
    /**
     * Initialize the module
     */
    init() {
        // Check if user is logged in and is an artist
        if (!authService.isLoggedIn || !authService.isArtist()) {
            // Redirect to login page
            window.location.href = 'login.html';
            return;
        }
        
        // Initialize form submission
        this.initFormSubmission();
        
        // Initialize image preview functionality
        this.initImagePreview();
        
        // Load artist's artworks
        this.loadArtistArtworks();
    }
    
    /**
     * Initialize form submission
     */
    initFormSubmission() {
        this.form.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // Get form data
            const formData = new FormData(this.form);
            
            // Get current user and artist
            const user = authService.getCurrentUser();
            const artist = await window.dbServiceAPI.getArtistByUserId(user.id);
            
            if (!artist) {
                this.showNotification('Error: Artist profile not found. Please create an artist profile first.', 'error');
                return;
            }
            
            // Create artwork object
            const artwork = {
                title: formData.get('title'),
                description: formData.get('description'),
                category: formData.get('category'),
                medium: formData.get('medium'),
                dimensions: formData.get('dimensions'),
                year: parseInt(formData.get('year')),
                price: parseFloat(formData.get('price')),
                salePrice: formData.get('sale-price') ? parseFloat(formData.get('sale-price')) : null,
                quantity: parseInt(formData.get('quantity')),
                tags: formData.get('tags') ? formData.get('tags') : '',
                artistId: artist.id
            };
            
            // Handle image uploads
            const imageFiles = this.imageInput.files;
            
            try {
                // Show loading notification
                this.showNotification('Uploading artwork...', 'info');
                
                // Upload artwork with images to the database via API
                const createdArtwork = await window.dbServiceAPI.createArtwork(artwork, imageFiles);
                
                if (createdArtwork) {
                    // Show success notification
                    this.showNotification('Artwork uploaded successfully!', 'success');
                    
                    // Reset form
                    this.form.reset();
                    this.imagePreview.innerHTML = '';
                    
                    // Reload artworks
                    this.loadArtistArtworks();
                } else {
                    this.showNotification('Error: Failed to upload artwork.', 'error');
                }
            } catch (error) {
                console.error('Error uploading artwork:', error);
                this.showNotification(`Error: ${error.message}`, 'error');
            }
        });
    }
    
    /**
     * Initialize image preview functionality
     */
    initImagePreview() {
        this.imageInput.addEventListener('change', (event) => {
            this.previewImages(event.target.files);
        });
        
        // Handle drag and drop
        const uploadContainer = document.querySelector('.image-upload-container');
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadContainer.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
        
        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadContainer.addEventListener(eventName, () => {
                uploadContainer.classList.add('highlight');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadContainer.addEventListener(eventName, () => {
                uploadContainer.classList.remove('highlight');
            }, false);
        });
        
        // Handle dropped files
        uploadContainer.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            this.imageInput.files = files;
            this.previewImages(files);
        }, false);
    }
    
    /**
     * Preview images before upload
     * @param {FileList} files - The files to preview
     */
    previewImages(files) {
        if (!files || files.length === 0) return;
        
        this.imagePreview.innerHTML = '';
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            if (!file.type.match('image.*')) continue;
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'Image Preview';
                
                const imgContainer = document.createElement('div');
                imgContainer.className = 'preview-image';
                imgContainer.appendChild(img);
                
                this.imagePreview.appendChild(imgContainer);
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    /**
     * Load the artist's artworks
     */
    async loadArtistArtworks() {
        try {
            // Get current user and artist
            const user = authService.getCurrentUser();
            const artist = await window.dbServiceAPI.getArtistByUserId(user.id);
            
            if (!artist) {
                this.artworksContainer.innerHTML = '<p>No artist profile found. Please create an artist profile first.</p>';
                return;
            }
            
            // Get artist's artworks
            const artworks = await window.dbServiceAPI.getArtworksByArtistId(artist.id);
            
            if (!artworks || artworks.length === 0) {
                this.artworksContainer.innerHTML = '<p>You haven\'t uploaded any artworks yet.</p>';
                return;
            }
            
            // Display artworks
            this.artworksContainer.innerHTML = '';
            
            artworks.forEach(artwork => {
                const artworkCard = document.createElement('div');
                artworkCard.className = 'artwork-card';
                
                // Get main image or first image
                let imagePath = '/images/artworks/placeholder.jpg';
                if (artwork.images && artwork.images.length > 0) {
                    // Find main image
                    const mainImage = artwork.images.find(img => img.isMain === 1);
                    if (mainImage) {
                        imagePath = mainImage.imagePath;
                    } else if (artwork.images[0]) {
                        imagePath = artwork.images[0].imagePath;
                    }
                }
                
                artworkCard.innerHTML = `
                    <div class="artwork-image">
                        <img src="${imagePath}" alt="${artwork.title}">
                        <div class="artwork-overlay">
                            <a href="artwork-details.html?id=${artwork.id}" class="btn btn-view">View Details</a>
                        </div>
                    </div>
                    <div class="artwork-info">
                        <h3>${artwork.title}</h3>
                        <p class="price">$${artwork.price.toFixed(2)}</p>
                        <p class="status">${artwork.status.charAt(0).toUpperCase() + artwork.status.slice(1)}</p>
                        <div class="artwork-actions">
                            <a href="artwork-edit.html?id=${artwork.id}" class="btn btn-edit">Edit</a>
                            <button class="btn btn-delete" data-id="${artwork.id}">Delete</button>
                        </div>
                    </div>
                `;
                
                // Add delete event listener
                const deleteBtn = artworkCard.querySelector('.btn-delete');
                deleteBtn.addEventListener('click', (event) => {
                    this.handleDeleteArtwork(artwork.id);
                });
                
                this.artworksContainer.appendChild(artworkCard);
            });
        } catch (error) {
            console.error('Error loading artworks:', error);
            this.artworksContainer.innerHTML = `<p>Error loading artworks: ${error.message}</p>`;
        }
    }
    
    /**
     * Handle artwork deletion
     * @param {number} artworkId - The ID of the artwork to delete
     */
    async handleDeleteArtwork(artworkId) {
        if (confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
            try {
                // Delete artwork via API
                const success = await window.dbServiceAPI.deleteArtwork(artworkId);
                
                if (success) {
                    this.showNotification('Artwork deleted successfully!', 'success');
                    this.loadArtistArtworks();
                } else {
                    this.showNotification('Error: Failed to delete artwork.', 'error');
                }
            } catch (error) {
                console.error('Error deleting artwork:', error);
                this.showNotification(`Error: ${error.message}`, 'error');
            }
        }
    }
    
    /**
     * Show a notification message
     * @param {string} message - The message to display
     * @param {string} type - The type of notification (success, error, info)
     */
    showNotification(message, type = 'info') {
        // Check if notification container exists
        let notificationContainer = document.querySelector('.notification-container');
        
        if (!notificationContainer) {
            // Create notification container
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <p>${message}</p>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Add close button event listener
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        // Add notification to container
        notificationContainer.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize the artist upload module when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.artistUploadModule = new ArtistUploadModule();
});
