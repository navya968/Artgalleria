/**
 * Database Service API for ArtGalleria
 * Provides methods to interact with the SQLite database via API calls
 */

class DbServiceAPI {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api';
    }

    /**
     * Make a GET request to the API
     * @param {string} endpoint - The API endpoint
     * @returns {Promise<Object>} - The response data
     */
    async get(endpoint) {
        try {
            const response = await fetch(`${this.apiUrl}${endpoint}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error in GET ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Make a POST request to the API
     * @param {string} endpoint - The API endpoint
     * @param {Object} data - The data to send
     * @returns {Promise<Object>} - The response data
     */
    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.apiUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error(`Error in POST ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Upload files with form data to the API
     * @param {string} endpoint - The API endpoint
     * @param {FormData} formData - The form data with files
     * @returns {Promise<Object>} - The response data
     */
    async uploadFiles(endpoint, formData) {
        try {
            const response = await fetch(`${this.apiUrl}${endpoint}`, {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error(`Error in file upload ${endpoint}:`, error);
            throw error;
        }
    }

    // User methods
    /**
     * Get all users
     * @returns {Promise<Array>} - Array of users
     */
    async getUsers() {
        const response = await this.get('/users');
        return response.success ? response.users : [];
    }

    /**
     * Get a user by ID
     * @param {number} id - The user ID
     * @returns {Promise<Object|null>} - The user object or null if not found
     */
    async getUserById(id) {
        try {
            const response = await this.get(`/users/${id}`);
            return response.success ? response.user : null;
        } catch (error) {
            console.error(`Error getting user ${id}:`, error);
            return null;
        }
    }

    /**
     * Create a new user
     * @param {Object} userData - The user data
     * @returns {Promise<Object|null>} - The created user or null if failed
     */
    async createUser(userData) {
        try {
            const response = await this.post('/users', userData);
            if (response.success) {
                // Get the created user
                return await this.getUserById(response.userId);
            }
            return null;
        } catch (error) {
            console.error('Error creating user:', error);
            return null;
        }
    }

    // Artist methods
    /**
     * Get all artists
     * @returns {Promise<Array>} - Array of artists
     */
    async getArtists() {
        const response = await this.get('/artists');
        return response.success ? response.artists : [];
    }

    /**
     * Get an artist by ID
     * @param {number} id - The artist ID
     * @returns {Promise<Object|null>} - The artist object or null if not found
     */
    async getArtistById(id) {
        try {
            const response = await this.get(`/artists/${id}`);
            return response.success ? response.artist : null;
        } catch (error) {
            console.error(`Error getting artist ${id}:`, error);
            return null;
        }
    }

    /**
     * Get an artist by user ID
     * @param {number} userId - The user ID
     * @returns {Promise<Object|null>} - The artist object or null if not found
     */
    async getArtistByUserId(userId) {
        try {
            const response = await this.get(`/users/${userId}/artist`);
            return response.success ? response.artist : null;
        } catch (error) {
            // If 404, the user is not an artist
            if (error.message.includes('404')) {
                return null;
            }
            console.error(`Error getting artist for user ${userId}:`, error);
            return null;
        }
    }

    // Artwork methods
    /**
     * Get all artworks
     * @returns {Promise<Array>} - Array of artworks
     */
    async getArtworks() {
        const response = await this.get('/artworks');
        return response.success ? response.artworks : [];
    }

    /**
     * Get an artwork by ID
     * @param {number} id - The artwork ID
     * @returns {Promise<Object|null>} - The artwork object or null if not found
     */
    async getArtworkById(id) {
        try {
            const response = await this.get(`/artworks/${id}`);
            return response.success ? response.artwork : null;
        } catch (error) {
            console.error(`Error getting artwork ${id}:`, error);
            return null;
        }
    }

    /**
     * Get artworks by artist ID
     * @param {number} artistId - The artist ID
     * @returns {Promise<Array>} - Array of artworks
     */
    async getArtworksByArtistId(artistId) {
        try {
            const response = await this.get(`/artists/${artistId}/artworks`);
            return response.success ? response.artworks : [];
        } catch (error) {
            console.error(`Error getting artworks for artist ${artistId}:`, error);
            return [];
        }
    }

    /**
     * Create a new artwork with images
     * @param {Object} artworkData - The artwork data
     * @param {FileList} imageFiles - The image files to upload
     * @returns {Promise<Object|null>} - The created artwork or null if failed
     */
    async createArtwork(artworkData, imageFiles) {
        try {
            // Create FormData for file upload
            const formData = new FormData();
            
            // Add artwork data
            Object.keys(artworkData).forEach(key => {
                if (key !== 'images') {
                    formData.append(key, artworkData[key]);
                }
            });
            
            // Add image files
            if (imageFiles && imageFiles.length > 0) {
                for (let i = 0; i < imageFiles.length; i++) {
                    formData.append('images', imageFiles[i]);
                }
            }
            
            // Upload artwork with images
            const response = await this.uploadFiles('/artworks', formData);
            
            if (response.success) {
                return response.artwork;
            }
            return null;
        } catch (error) {
            console.error('Error creating artwork:', error);
            return null;
        }
    }

    /**
     * Add an image to an existing artwork
     * @param {number} artworkId - The artwork ID
     * @param {File} imageFile - The image file to upload
     * @returns {Promise<Object|null>} - The uploaded image info or null if failed
     */
    async addArtworkImage(artworkId, imageFile) {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            
            const response = await this.uploadFiles(`/artworks/${artworkId}/images`, formData);
            
            if (response.success) {
                return response.image;
            }
            return null;
        } catch (error) {
            console.error(`Error adding image to artwork ${artworkId}:`, error);
            return null;
        }
    }

    /**
     * Migrate data from localStorage to the SQLite database
     * @returns {Promise<boolean>} - Whether the migration was successful
     */
    async migrateData() {
        try {
            const response = await this.get('/migrate');
            return response.success;
        } catch (error) {
            console.error('Error migrating data:', error);
            return false;
        }
    }
}

// Create a global instance of the DbServiceAPI
window.dbServiceAPI = new DbServiceAPI();
