/**
 * Database Service for ArtGalleria
 * Provides methods to interact with the JSON database using localStorage
 */

class DbService {
    /**
     * Load data from localStorage
     * @param {string} file - The key to load from localStorage
     * @returns {Promise<Object>} - The parsed JSON data
     */
    static async loadData(file) {
        try {
            // Remove .json extension if present
            const key = file.replace('.json', '');
            const data = localStorage.getItem(key);
            
            if (!data) {
                // Initialize with empty data structure if not found
                const emptyData = this.getEmptyDataStructure(key);
                localStorage.setItem(key, JSON.stringify(emptyData));
                return emptyData;
            }
            
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
            return this.getEmptyDataStructure(file.replace('.json', ''));
        }
    }

    /**
     * Get empty data structure based on the file type
     * @param {string} key - The localStorage key
     * @returns {Object} - Empty data structure
     */
    static getEmptyDataStructure(key) {
        switch (key) {
            case 'users':
                return { users: [] };
            case 'artists':
                return { artists: [] };
            case 'artworks':
                return { artworks: [] };
            case 'exhibitions':
                return { exhibitions: [] };
            case 'orders':
                return { orders: [] };
            default:
                return {};
        }
    }

    /**
     * Save data to localStorage
     * @param {string} file - The key to save to in localStorage
     * @param {Object} data - The data to save
     * @returns {Promise<boolean>} - Whether the save was successful
     */
    static async saveData(file, data) {
        try {
            // Remove .json extension if present
            const key = file.replace('.json', '');
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving ${file}:`, error);
            return false;
        }
    }

    // User methods
    /**
     * Get all users
     * @returns {Promise<Array>} - Array of users
     */
    static async getUsers() {
        const data = await this.loadData('users.json');
        return data ? data.users : [];
    }

    /**
     * Get a user by ID
     * @param {number} id - The user ID
     * @returns {Promise<Object|null>} - The user object or null if not found
     */
    static async getUserById(id) {
        const users = await this.getUsers();
        return users.find(user => user.id === id) || null;
    }

    /**
     * Get a user by username
     * @param {string} username - The username
     * @returns {Promise<Object|null>} - The user object or null if not found
     */
    static async getUserByUsername(username) {
        const users = await this.getUsers();
        return users.find(user => user.username === username) || null;
    }

    /**
     * Get a user by email
     * @param {string} email - The email
     * @returns {Promise<Object|null>} - The user object or null if not found
     */
    static async getUserByEmail(email) {
        const users = await this.getUsers();
        return users.find(user => user.email === email) || null;
    }

    /**
     * Create a new user
     * @param {Object} userData - The user data
     * @returns {Promise<Object|null>} - The created user or null if failed
     */
    static async createUser(userData) {
        const data = await this.loadData('users.json');
        if (!data) return null;

        // Check if user with same email or username already exists
        const existingUser = data.users.find(
            user => user.email === userData.email || user.username === userData.username
        );
        
        if (existingUser) {
            console.error('User with this email or username already exists');
            return null;
        }

        // Generate new ID
        const newId = Math.max(...data.users.map(user => user.id), 0) + 1;
        
        // Create new user object
        const newUser = {
            id: newId,
            ...userData,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        // Add to users array
        data.users.push(newUser);
        
        // Save updated data
        const success = await this.saveData('users.json', data);
        return success ? newUser : null;
    }

    /**
     * Update a user
     * @param {number} id - The user ID
     * @param {Object} userData - The updated user data
     * @returns {Promise<Object|null>} - The updated user or null if failed
     */
    static async updateUser(id, userData) {
        const data = await this.loadData('users.json');
        if (!data) return null;

        const userIndex = data.users.findIndex(user => user.id === id);
        if (userIndex === -1) {
            console.error(`User with ID ${id} not found`);
            return null;
        }

        // Update user data
        data.users[userIndex] = {
            ...data.users[userIndex],
            ...userData
        };

        // Save updated data
        const success = await this.saveData('users.json', data);
        return success ? data.users[userIndex] : null;
    }

    /**
     * Delete a user
     * @param {number} id - The user ID
     * @returns {Promise<boolean>} - Whether the deletion was successful
     */
    static async deleteUser(id) {
        const data = await this.loadData('users.json');
        if (!data) return false;

        const userIndex = data.users.findIndex(user => user.id === id);
        if (userIndex === -1) {
            console.error(`User with ID ${id} not found`);
            return false;
        }

        // Remove user
        data.users.splice(userIndex, 1);

        // Save updated data
        return await this.saveData('users.json', data);
    }

    /**
     * Authenticate a user
     * @param {string} email - The user email
     * @param {string} password - The user password
     * @returns {Promise<Object|null>} - The authenticated user or null if authentication failed
     */
    static async authenticateUser(email, password) {
        const user = await this.getUserByEmail(email);
        
        if (!user) {
            console.error('User not found');
            return null;
        }

        // In a real application, you would hash the password and compare with the stored hash
        // For this demo, we're comparing plain text passwords
        if (user.password !== password) {
            console.error('Invalid password');
            return null;
        }

        // Update last login
        await this.updateUser(user.id, { lastLogin: new Date().toISOString() });

        return user;
    }

    // Artist methods
    /**
     * Get all artists
     * @returns {Promise<Array>} - Array of artists
     */
    static async getArtists() {
        const data = await this.loadData('artists.json');
        return data ? data.artists : [];
    }

    /**
     * Get an artist by ID
     * @param {number} id - The artist ID
     * @returns {Promise<Object|null>} - The artist object or null if not found
     */
    static async getArtistById(id) {
        const artists = await this.getArtists();
        return artists.find(artist => artist.id === id) || null;
    }

    /**
     * Get an artist by user ID
     * @param {number} userId - The user ID
     * @returns {Promise<Object|null>} - The artist object or null if not found
     */
    static async getArtistByUserId(userId) {
        const artists = await this.getArtists();
        return artists.find(artist => artist.userId === userId) || null;
    }

    /**
     * Get featured artists
     * @param {number} limit - The maximum number of artists to return
     * @returns {Promise<Array>} - Array of featured artists
     */
    static async getFeaturedArtists(limit = 4) {
        const artists = await this.getArtists();
        return artists
            .filter(artist => artist.featured)
            .slice(0, limit);
    }

    /**
     * Create a new artist
     * @param {Object} artistData - The artist data
     * @returns {Promise<Object|null>} - The created artist or null if failed
     */
    static async createArtist(artistData) {
        const data = await this.loadData('artists.json');
        if (!data) return null;

        // Generate new ID
        const newId = Math.max(...data.artists.map(artist => artist.id), 0) + 1;
        
        // Create new artist object
        const newArtist = {
            id: newId,
            ...artistData,
            featured: false,
            createdAt: new Date().toISOString()
        };
        
        // Add to artists array
        data.artists.push(newArtist);
        
        // Save updated data
        const success = await this.saveData('artists.json', data);
        return success ? newArtist : null;
    }

    /**
     * Update an artist
     * @param {number} id - The artist ID
     * @param {Object} artistData - The updated artist data
     * @returns {Promise<Object|null>} - The updated artist or null if failed
     */
    static async updateArtist(id, artistData) {
        const data = await this.loadData('artists.json');
        if (!data) return null;

        const artistIndex = data.artists.findIndex(artist => artist.id === id);
        if (artistIndex === -1) {
            console.error(`Artist with ID ${id} not found`);
            return null;
        }

        // Update artist data
        data.artists[artistIndex] = {
            ...data.artists[artistIndex],
            ...artistData
        };

        // Save updated data
        const success = await this.saveData('artists.json', data);
        return success ? data.artists[artistIndex] : null;
    }

    /**
     * Delete an artist
     * @param {number} id - The artist ID
     * @returns {Promise<boolean>} - Whether the deletion was successful
     */
    static async deleteArtist(id) {
        const data = await this.loadData('artists.json');
        if (!data) return false;

        const artistIndex = data.artists.findIndex(artist => artist.id === id);
        if (artistIndex === -1) {
            console.error(`Artist with ID ${id} not found`);
            return false;
        }

        // Remove artist
        data.artists.splice(artistIndex, 1);

        // Save updated data
        return await this.saveData('artists.json', data);
    }

    /**
     * Search for artists
     * @param {string} query - The search query
     * @returns {Promise<Array>} - Array of matching artists
     */
    static async searchArtists(query) {
        if (!query) return this.getArtists();
        
        const artists = await this.getArtists();
        const lowerQuery = query.toLowerCase();
        
        return artists.filter(artist => 
            artist.name.toLowerCase().includes(lowerQuery) ||
            artist.location.toLowerCase().includes(lowerQuery) ||
            artist.title.toLowerCase().includes(lowerQuery) ||
            artist.bio.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Filter artists by criteria
     * @param {Object} filters - The filter criteria
     * @returns {Promise<Array>} - Array of filtered artists
     */
    static async filterArtists(filters) {
        let artists = await this.getArtists();
        
        // Apply filters
        if (filters) {
            if (filters.location) {
                artists = artists.filter(artist => 
                    artist.location.toLowerCase().includes(filters.location.toLowerCase())
                );
            }
            
            if (filters.featured) {
                artists = artists.filter(artist => artist.featured);
            }
            
            // Add more filters as needed
        }
        
        return artists;
    }

    // Artwork methods
    /**
     * Get all artworks
     * @returns {Promise<Array>} - Array of artworks
     */
    static async getArtworks() {
        const data = await this.loadData('artworks.json');
        return data ? data.artworks : [];
    }

    /**
     * Get an artwork by ID
     * @param {number} id - The artwork ID
     * @returns {Promise<Object|null>} - The artwork object or null if not found
     */
    static async getArtworkById(id) {
        const artworks = await this.getArtworks();
        return artworks.find(artwork => artwork.id === id) || null;
    }

    /**
     * Get artworks by artist ID
     * @param {number} artistId - The artist ID
     * @returns {Promise<Array>} - Array of artworks by the artist
     */
    static async getArtworksByArtist(artistId) {
        const artworks = await this.getArtworks();
        return artworks.filter(artwork => artwork.artistId === artistId);
    }

    /**
     * Get featured artworks
     * @param {number} limit - The maximum number of artworks to return
     * @returns {Promise<Array>} - Array of featured artworks
     */
    static async getFeaturedArtworks(limit = 6) {
        const artworks = await this.getArtworks();
        return artworks
            .filter(artwork => artwork.featured)
            .slice(0, limit);
    }

    /**
     * Create a new artwork
     * @param {Object} artworkData - The artwork data
     * @returns {Promise<Object|null>} - The created artwork or null if failed
     */
    static async createArtwork(artworkData) {
        const data = await this.loadData('artworks.json');
        if (!data) return null;

        // Generate new ID
        const newId = Math.max(...data.artworks.map(artwork => artwork.id), 0) + 1;
        
        // Create new artwork object
        const newArtwork = {
            id: newId,
            ...artworkData,
            views: 0,
            likes: 0,
            featured: false,
            createdAt: new Date().toISOString()
        };
        
        // Add to artworks array
        data.artworks.push(newArtwork);
        
        // Save updated data
        const success = await this.saveData('artworks.json', data);
        return success ? newArtwork : null;
    }

    /**
     * Update an artwork
     * @param {number} id - The artwork ID
     * @param {Object} artworkData - The updated artwork data
     * @returns {Promise<Object|null>} - The updated artwork or null if failed
     */
    static async updateArtwork(id, artworkData) {
        const data = await this.loadData('artworks.json');
        if (!data) return null;

        const artworkIndex = data.artworks.findIndex(artwork => artwork.id === id);
        if (artworkIndex === -1) {
            console.error(`Artwork with ID ${id} not found`);
            return null;
        }

        // Update artwork data
        data.artworks[artworkIndex] = {
            ...data.artworks[artworkIndex],
            ...artworkData
        };

        // Save updated data
        const success = await this.saveData('artworks.json', data);
        return success ? data.artworks[artworkIndex] : null;
    }

    /**
     * Delete an artwork
     * @param {number} id - The artwork ID
     * @returns {Promise<boolean>} - Whether the deletion was successful
     */
    static async deleteArtwork(id) {
        const data = await this.loadData('artworks.json');
        if (!data) return false;

        const artworkIndex = data.artworks.findIndex(artwork => artwork.id === id);
        if (artworkIndex === -1) {
            console.error(`Artwork with ID ${id} not found`);
            return false;
        }

        // Remove artwork
        data.artworks.splice(artworkIndex, 1);

        // Save updated data
        return await this.saveData('artworks.json', data);
    }

    /**
     * Search for artworks
     * @param {string} query - The search query
     * @returns {Promise<Array>} - Array of matching artworks
     */
    static async searchArtworks(query) {
        if (!query) return this.getArtworks();
        
        const artworks = await this.getArtworks();
        const lowerQuery = query.toLowerCase();
        
        return artworks.filter(artwork => 
            artwork.title.toLowerCase().includes(lowerQuery) ||
            artwork.description.toLowerCase().includes(lowerQuery) ||
            artwork.category.toLowerCase().includes(lowerQuery) ||
            artwork.medium.toLowerCase().includes(lowerQuery) ||
            artwork.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Filter artworks by criteria
     * @param {Object} filters - The filter criteria
     * @returns {Promise<Array>} - Array of filtered artworks
     */
    static async filterArtworks(filters) {
        let artworks = await this.getArtworks();
        
        // Apply filters
        if (filters) {
            if (filters.category) {
                artworks = artworks.filter(artwork => 
                    artwork.category.toLowerCase() === filters.category.toLowerCase()
                );
            }
            
            if (filters.medium) {
                artworks = artworks.filter(artwork => 
                    artwork.medium.toLowerCase().includes(filters.medium.toLowerCase())
                );
            }
            
            if (filters.priceMin !== undefined) {
                artworks = artworks.filter(artwork => 
                    artwork.price >= filters.priceMin
                );
            }
            
            if (filters.priceMax !== undefined) {
                artworks = artworks.filter(artwork => 
                    artwork.price <= filters.priceMax
                );
            }
            
            if (filters.artistId !== undefined) {
                artworks = artworks.filter(artwork => 
                    artwork.artistId === filters.artistId
                );
            }
            
            if (filters.onSale) {
                artworks = artworks.filter(artwork => artwork.onSale);
            }
            
            if (filters.inStock) {
                artworks = artworks.filter(artwork => artwork.inStock);
            }
            
            // Add more filters as needed
        }
        
        return artworks;
    }

    // Exhibition methods
    /**
     * Get all exhibitions
     * @returns {Promise<Array>} - Array of exhibitions
     */
    static async getExhibitions() {
        const data = await this.loadData('exhibitions.json');
        return data ? data.exhibitions : [];
    }

    /**
     * Get an exhibition by ID
     * @param {number} id - The exhibition ID
     * @returns {Promise<Object|null>} - The exhibition object or null if not found
     */
    static async getExhibitionById(id) {
        const exhibitions = await this.getExhibitions();
        return exhibitions.find(exhibition => exhibition.id === id) || null;
    }

    /**
     * Get exhibitions by status
     * @param {string} status - The exhibition status (upcoming, current, past)
     * @returns {Promise<Array>} - Array of exhibitions with the specified status
     */
    static async getExhibitionsByStatus(status) {
        const exhibitions = await this.getExhibitions();
        return exhibitions.filter(exhibition => exhibition.status === status);
    }

    /**
     * Get exhibitions by artist ID
     * @param {number} artistId - The artist ID
     * @returns {Promise<Array>} - Array of exhibitions featuring the artist
     */
    static async getExhibitionsByArtist(artistId) {
        const exhibitions = await this.getExhibitions();
        return exhibitions.filter(exhibition => 
            exhibition.artists.includes(artistId)
        );
    }

    // Order methods
    /**
     * Get all orders
     * @returns {Promise<Array>} - Array of orders
     */
    static async getOrders() {
        const data = await this.loadData('orders.json');
        return data ? data.orders : [];
    }

    /**
     * Get an order by ID
     * @param {number} id - The order ID
     * @returns {Promise<Object|null>} - The order object or null if not found
     */
    static async getOrderById(id) {
        const orders = await this.getOrders();
        return orders.find(order => order.id === id) || null;
    }

    /**
     * Get orders by user ID
     * @param {number} userId - The user ID
     * @returns {Promise<Array>} - Array of orders by the user
     */
    static async getOrdersByUser(userId) {
        const orders = await this.getOrders();
        return orders.filter(order => order.userId === userId);
    }

    /**
     * Create a new order
     * @param {Object} orderData - The order data
     * @returns {Promise<Object|null>} - The created order or null if failed
     */
    static async createOrder(orderData) {
        const data = await this.loadData('orders.json');
        if (!data) return null;

        // Generate new ID
        const newId = Math.max(...data.orders.map(order => order.id), 0) + 1;
        
        // Generate order number
        const date = new Date();
        const orderNumber = `ORD-${date.getFullYear().toString().substring(2)}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${newId.toString().padStart(2, '0')}`;
        
        // Create new order object
        const newOrder = {
            id: newId,
            orderNumber,
            ...orderData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Add to orders array
        data.orders.push(newOrder);
        
        // Save updated data
        const success = await this.saveData('orders.json', data);
        return success ? newOrder : null;
    }

    /**
     * Update an order
     * @param {number} id - The order ID
     * @param {Object} orderData - The updated order data
     * @returns {Promise<Object|null>} - The updated order or null if failed
     */
    static async updateOrder(id, orderData) {
        const data = await this.loadData('orders.json');
        if (!data) return null;

        const orderIndex = data.orders.findIndex(order => order.id === id);
        if (orderIndex === -1) {
            console.error(`Order with ID ${id} not found`);
            return null;
        }

        // Update order data
        data.orders[orderIndex] = {
            ...data.orders[orderIndex],
            ...orderData,
            updatedAt: new Date().toISOString()
        };

        // Save updated data
        const success = await this.saveData('orders.json', data);
        return success ? data.orders[orderIndex] : null;
    }

    // Image upload methods
    /**
     * Upload an image
     * @param {File} image - The image to upload
     * @param {string} type - The type of image (user, artist, artwork, exhibition)
     * @param {string} id - The ID of the item the image belongs to
     * @returns {Promise<string|null>} - The ID of the uploaded image or null if failed
     */
    static async uploadImage(image, type, id) {
        try {
            const response = await fetch('/api/upload-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: image,
                    type: type,
                    id: id
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to upload image: ${response.statusText}`);
            }
            
            const imageId = await response.text();
            return imageId;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    }

    /**
     * Upload multiple images
     * @param {FileList|Array<File>} images - The images to upload
     * @param {string} type - The type of images (user, artist, artwork, exhibition)
     * @param {string} id - The ID of the item the images belong to
     * @returns {Promise<Array<string>|null>} - The IDs of the uploaded images or null if failed
     */
    static async uploadMultipleImages(images, type, id) {
        try {
            const response = await fetch('/api/upload-multiple-images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    images: images,
                    type: type,
                    id: id
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to upload images: ${response.statusText}`);
            }
            
            const imageIds = await response.json();
            return imageIds;
        } catch (error) {
            console.error('Error uploading images:', error);
            return null;
        }
    }

    /**
     * Delete an image
     * @param {string} imageId - The ID of the image to delete
     * @returns {Promise<boolean>} - Whether the deletion was successful
     */
    static async deleteImage(imageId) {
        try {
            const response = await fetch('/api/delete-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageId: imageId
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to delete image: ${response.statusText}`);
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting image:', error);
            return false;
        }
    }
}

// Export the DbService class
window.DbService = DbService;
