/**
 * File Upload Service for ArtGalleria
 * Handles image uploads for artists, artworks, users, and exhibitions
 */

class FileUploadService {
    /**
     * Initialize the file upload service
     */
    constructor() {
        // Create storage for images if it doesn't exist
        if (!localStorage.getItem('artgalleria_images')) {
            localStorage.setItem('artgalleria_images', JSON.stringify({}));
        }
        
        // Default image placeholders
        this.defaultImages = {
            artwork: 'images/artworks/placeholder.jpg',
            artist: 'images/artists/placeholder.jpg',
            user: 'images/users/placeholder.jpg',
            exhibition: 'images/exhibitions/placeholder.jpg'
        };
    }
    
    /**
     * Upload a single image file
     * @param {File} file - The image file to upload
     * @param {string} type - The type of image (artwork, artist, user, exhibition)
     * @param {string} id - The ID to associate with the image
     * @returns {Promise<string>} - The path/ID of the uploaded image
     */
    async uploadImage(file, type, id) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.match('image.*')) {
                reject(new Error('Invalid file type. Please upload an image.'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    // Get the image data as base64
                    const imageData = event.target.result;
                    
                    // Generate a unique image ID
                    const imageId = `${type}_${id}_${Date.now()}`;
                    
                    // Store the image data
                    const images = JSON.parse(localStorage.getItem('artgalleria_images'));
                    images[imageId] = imageData;
                    localStorage.setItem('artgalleria_images', JSON.stringify(images));
                    
                    // Return the image ID as the path
                    resolve(imageId);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = (error) => {
                reject(error);
            };
            
            // Read the file as a data URL (base64)
            reader.readAsDataURL(file);
        });
    }
    
    /**
     * Upload multiple image files
     * @param {FileList} files - The image files to upload
     * @param {string} type - The type of images (artwork, artist, user, exhibition)
     * @param {string} id - The ID to associate with the images
     * @returns {Promise<string[]>} - The paths/IDs of the uploaded images
     */
    async uploadMultipleImages(files, type, id) {
        if (!files || files.length === 0) {
            return [];
        }
        
        const uploadPromises = [];
        
        for (let i = 0; i < files.length; i++) {
            uploadPromises.push(this.uploadImage(files[i], type, id));
        }
        
        return Promise.all(uploadPromises);
    }
    
    /**
     * Get an image by its ID
     * @param {string} imageId - The ID of the image to retrieve
     * @returns {string|null} - The image data or null if not found
     */
    getImage(imageId) {
        try {
            const images = JSON.parse(localStorage.getItem('artgalleria_images'));
            return images[imageId] || null;
        } catch (error) {
            console.error('Error retrieving image:', error);
            return null;
        }
    }
    
    /**
     * Delete an image by its ID
     * @param {string} imageId - The ID of the image to delete
     * @returns {boolean} - Whether the deletion was successful
     */
    deleteImage(imageId) {
        try {
            const images = JSON.parse(localStorage.getItem('artgalleria_images'));
            
            if (!images[imageId]) {
                return false;
            }
            
            delete images[imageId];
            localStorage.setItem('artgalleria_images', JSON.stringify(images));
            
            return true;
        } catch (error) {
            console.error('Error deleting image:', error);
            return false;
        }
    }
    
    /**
     * Get the default image for a type
     * @param {string} type - The type of image (artwork, artist, user, exhibition)
     * @returns {string} - The default image path
     */
    getDefaultImage(type) {
        return this.defaultImages[type] || this.defaultImages.artwork;
    }
    
    /**
     * Check if a string is an image ID
     * @param {string} str - The string to check
     * @returns {boolean} - Whether the string is an image ID
     */
    isImageId(str) {
        return str && typeof str === 'string' && str.match(/^(artwork|artist|user|exhibition)_.*_\d+$/);
    }
    
    /**
     * Get the image source (data URL or path)
     * @param {string} imageIdOrPath - The image ID or path
     * @param {string} type - The type of image for default fallback
     * @returns {string} - The image source
     */
    getImageSrc(imageIdOrPath, type = 'artwork') {
        if (!imageIdOrPath) {
            return this.getDefaultImage(type);
        }
        
        if (this.isImageId(imageIdOrPath)) {
            return this.getImage(imageIdOrPath) || this.getDefaultImage(type);
        }
        
        return imageIdOrPath;
    }
}

// Create a global instance of the FileUploadService
window.fileUploadService = new FileUploadService();

/**
 * Initialize image elements to handle both stored images and regular paths
 */
document.addEventListener('DOMContentLoaded', function() {
    // Process all images with data-image-id attributes
    const images = document.querySelectorAll('img[data-image-id]');
    
    images.forEach(img => {
        const imageId = img.getAttribute('data-image-id');
        const type = img.getAttribute('data-image-type') || 'artwork';
        
        if (imageId) {
            const imageSrc = window.fileUploadService.getImageSrc(imageId, type);
            img.src = imageSrc;
        }
    });
});

/**
 * Helper function to create an image element with proper source handling
 * @param {string} imageIdOrPath - The image ID or path
 * @param {string} alt - The alt text for the image
 * @param {string} type - The type of image (artwork, artist, user, exhibition)
 * @param {string} className - Optional CSS class name
 * @returns {HTMLImageElement} - The created image element
 */
function createImageElement(imageIdOrPath, alt, type = 'artwork', className = '') {
    const img = document.createElement('img');
    img.alt = alt || 'Image';
    
    if (className) {
        img.className = className;
    }
    
    if (window.fileUploadService.isImageId(imageIdOrPath)) {
        img.setAttribute('data-image-id', imageIdOrPath);
        img.setAttribute('data-image-type', type);
        img.src = window.fileUploadService.getImageSrc(imageIdOrPath, type);
    } else {
        img.src = imageIdOrPath || window.fileUploadService.getDefaultImage(type);
    }
    
    return img;
}
