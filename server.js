/**
 * ArtGalleria Server
 * A simple Express server to handle SQLite database operations and file uploads
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Initialize SQLite database
const dbPath = path.join(__dirname, 'db', 'artgalleria.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        firstName TEXT,
        lastName TEXT,
        bio TEXT,
        profileImage TEXT,
        isArtist INTEGER DEFAULT 0,
        isAdmin INTEGER DEFAULT 0,
        createdAt TEXT,
        lastLogin TEXT
    )`);

    // Artists table
    db.run(`CREATE TABLE IF NOT EXISTS artists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        displayName TEXT NOT NULL,
        bio TEXT,
        location TEXT,
        specialties TEXT,
        website TEXT,
        profileImage TEXT,
        coverImage TEXT,
        featured INTEGER DEFAULT 0,
        createdAt TEXT,
        updatedAt TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
    )`);

    // Artworks table
    db.run(`CREATE TABLE IF NOT EXISTS artworks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        medium TEXT,
        dimensions TEXT,
        year INTEGER,
        price REAL,
        salePrice REAL,
        quantity INTEGER DEFAULT 1,
        tags TEXT,
        artistId INTEGER NOT NULL,
        status TEXT DEFAULT 'available',
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        createdAt TEXT,
        updatedAt TEXT,
        FOREIGN KEY (artistId) REFERENCES artists(id)
    )`);

    // Artwork Images table
    db.run(`CREATE TABLE IF NOT EXISTS artwork_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        artworkId INTEGER NOT NULL,
        imagePath TEXT NOT NULL,
        isMain INTEGER DEFAULT 0,
        createdAt TEXT,
        FOREIGN KEY (artworkId) REFERENCES artworks(id)
    )`);

    // Exhibitions table
    db.run(`CREATE TABLE IF NOT EXISTS exhibitions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        startDate TEXT,
        endDate TEXT,
        location TEXT,
        coverImage TEXT,
        status TEXT DEFAULT 'upcoming',
        createdAt TEXT,
        updatedAt TEXT
    )`);

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        totalAmount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        shippingAddress TEXT,
        billingAddress TEXT,
        paymentMethod TEXT,
        paymentId TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
    )`);

    // Order Items table
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER NOT NULL,
        artworkId INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (orderId) REFERENCES orders(id),
        FOREIGN KEY (artworkId) REFERENCES artworks(id)
    )`);

    console.log('Database tables initialized');
}

// Migrate data from JSON files to SQLite (if needed)
app.get('/api/migrate', (req, res) => {
    try {
        // Load JSON data
        const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'db', 'users.json'), 'utf8'));
        const artistsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'db', 'artists.json'), 'utf8'));
        const artworksData = JSON.parse(fs.readFileSync(path.join(__dirname, 'db', 'artworks.json'), 'utf8'));
        const exhibitionsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'db', 'exhibitions.json'), 'utf8'));
        const ordersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'db', 'orders.json'), 'utf8'));

        // Migrate users
        if (usersData && usersData.users) {
            usersData.users.forEach(user => {
                db.run(
                    `INSERT OR IGNORE INTO users 
                    (id, username, email, password, firstName, lastName, bio, profileImage, isArtist, isAdmin, createdAt, lastLogin) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [user.id, user.username, user.email, user.password, user.firstName, user.lastName, 
                    user.bio, user.profileImage, user.isArtist ? 1 : 0, user.isAdmin ? 1 : 0, user.createdAt, user.lastLogin]
                );
            });
        }

        // Migrate artists
        if (artistsData && artistsData.artists) {
            artistsData.artists.forEach(artist => {
                db.run(
                    `INSERT OR IGNORE INTO artists 
                    (id, userId, displayName, bio, location, specialties, website, profileImage, coverImage, featured, createdAt, updatedAt) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [artist.id, artist.userId, artist.displayName, artist.bio, artist.location, 
                    artist.specialties ? artist.specialties.join(',') : '', artist.website, 
                    artist.profileImage, artist.coverImage, artist.featured ? 1 : 0, artist.createdAt, artist.updatedAt]
                );
            });
        }

        // Migrate artworks
        if (artworksData && artworksData.artworks) {
            artworksData.artworks.forEach(artwork => {
                db.run(
                    `INSERT OR IGNORE INTO artworks 
                    (id, title, description, category, medium, dimensions, year, price, salePrice, quantity, tags, artistId, status, views, likes, createdAt, updatedAt) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [artwork.id, artwork.title, artwork.description, artwork.category, artwork.medium, 
                    artwork.dimensions, artwork.year, artwork.price, artwork.salePrice, artwork.quantity, 
                    artwork.tags ? artwork.tags.join(',') : '', artwork.artistId, artwork.status, 
                    artwork.views, artwork.likes, artwork.createdAt, artwork.updatedAt]
                );

                // Migrate artwork images
                if (artwork.images && artwork.images.length > 0) {
                    artwork.images.forEach((image, index) => {
                        db.run(
                            `INSERT OR IGNORE INTO artwork_images 
                            (artworkId, imagePath, isMain, createdAt) 
                            VALUES (?, ?, ?, ?)`,
                            [artwork.id, image, index === 0 ? 1 : 0, artwork.createdAt]
                        );
                    });
                }
            });
        }

        // Migrate exhibitions
        if (exhibitionsData && exhibitionsData.exhibitions) {
            exhibitionsData.exhibitions.forEach(exhibition => {
                db.run(
                    `INSERT OR IGNORE INTO exhibitions 
                    (id, title, description, startDate, endDate, location, coverImage, status, createdAt, updatedAt) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [exhibition.id, exhibition.title, exhibition.description, exhibition.startDate, 
                    exhibition.endDate, exhibition.location, exhibition.coverImage, exhibition.status, 
                    exhibition.createdAt, exhibition.updatedAt]
                );
            });
        }

        // Migrate orders
        if (ordersData && ordersData.orders) {
            ordersData.orders.forEach(order => {
                db.run(
                    `INSERT OR IGNORE INTO orders 
                    (id, userId, totalAmount, status, shippingAddress, billingAddress, paymentMethod, paymentId, createdAt, updatedAt) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [order.id, order.userId, order.totalAmount, order.status, 
                    JSON.stringify(order.shippingAddress), JSON.stringify(order.billingAddress), 
                    order.paymentMethod, order.paymentId, order.createdAt, order.updatedAt]
                );

                // Migrate order items
                if (order.items && order.items.length > 0) {
                    order.items.forEach(item => {
                        db.run(
                            `INSERT OR IGNORE INTO order_items 
                            (orderId, artworkId, quantity, price) 
                            VALUES (?, ?, ?, ?)`,
                            [order.id, item.artworkId, item.quantity, item.price]
                        );
                    });
                }
            });
        }

        res.json({ success: true, message: 'Data migration completed successfully' });
    } catch (error) {
        console.error('Error migrating data:', error);
        res.status(500).json({ success: false, message: 'Error migrating data', error: error.message });
    }
});

// API Routes

// User authentication endpoints
app.post('/api/users/register', (req, res) => {
    const { username, email, password, firstName, lastName, isArtist } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Username, email, and password are required' });
    }
    
    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], (err, existingUser) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error checking user existence', error: err.message });
        }
        
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email or username already exists' });
        }
        
        // Create new user
        const createdAt = new Date().toISOString();
        db.run(
            `INSERT INTO users (username, email, password, firstName, lastName, createdAt, lastLogin, isArtist) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [username, email, password, firstName || '', lastName || '', createdAt, createdAt, isArtist ? 1 : 0],
            function(err) {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Error creating user', error: err.message });
                }
                
                const userId = this.lastID;
                
                // If user is an artist, create an empty artist profile
                if (isArtist) {
                    db.run(
                        `INSERT INTO artists (userId, displayName, bio, createdAt, updatedAt) 
                        VALUES (?, ?, ?, ?, ?)`,
                        [userId, username, '', createdAt, createdAt],
                        function(err) {
                            if (err) {
                                console.error('Error creating artist profile:', err);
                                // Continue with user creation even if artist profile creation fails
                            }
                        }
                    );
                }
                
                // Get the created user
                db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Error fetching created user', error: err.message });
                    }
                    
                    // Remove password from response
                    const userResponse = { ...user };
                    delete userResponse.password;
                    
                    res.json({ success: true, user: userResponse });
                });
            }
        );
    });
});

app.post('/api/users/login', (req, res) => {
    const { usernameOrEmail, password } = req.body;
    
    if (!usernameOrEmail || !password) {
        return res.status(400).json({ success: false, message: 'Username/email and password are required' });
    }
    
    // Find user by username or email
    db.get(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [usernameOrEmail, usernameOrEmail],
        (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error during login', error: err.message });
            }
            
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid username/email or password' });
            }
            
            // Check password
            if (user.password !== password) {
                return res.status(401).json({ success: false, message: 'Invalid username/email or password' });
            }
            
            // Update last login
            const lastLogin = new Date().toISOString();
            db.run('UPDATE users SET lastLogin = ? WHERE id = ?', [lastLogin, user.id]);
            
            // Remove password from response
            const userResponse = { ...user };
            delete userResponse.password;
            
            res.json({ success: true, user: userResponse });
        }
    );
});

// Users
app.get('/api/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error fetching users', error: err.message });
        } else {
            res.json({ success: true, users: rows });
        }
    });
});

app.get('/api/users/:id', (req, res) => {
    db.get('SELECT * FROM users WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error fetching user', error: err.message });
        } else if (!row) {
            res.status(404).json({ success: false, message: 'User not found' });
        } else {
            res.json({ success: true, user: row });
        }
    });
});

app.post('/api/users', (req, res) => {
    const { username, email, password, firstName, lastName, bio } = req.body;
    const createdAt = new Date().toISOString();
    
    db.run(
        `INSERT INTO users (username, email, password, firstName, lastName, bio, createdAt, lastLogin) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, email, password, firstName || '', lastName || '', bio, createdAt, createdAt],
        function(err) {
            if (err) {
                res.status(500).json({ success: false, message: 'Error creating user', error: err.message });
            } else {
                res.json({ success: true, userId: this.lastID });
            }
        }
    );
});

// Artists
app.get('/api/artists', (req, res) => {
    db.all('SELECT * FROM artists', [], (err, rows) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error fetching artists', error: err.message });
        } else {
            res.json({ success: true, artists: rows });
        }
    });
});

app.get('/api/artists/:id', (req, res) => {
    db.get('SELECT * FROM artists WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error fetching artist', error: err.message });
        } else if (!row) {
            res.status(404).json({ success: false, message: 'Artist not found' });
        } else {
            res.json({ success: true, artist: row });
        }
    });
});

app.get('/api/users/:userId/artist', (req, res) => {
    db.get('SELECT * FROM artists WHERE userId = ?', [req.params.userId], (err, row) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error fetching artist', error: err.message });
        } else if (!row) {
            res.status(404).json({ success: false, message: 'Artist not found for this user' });
        } else {
            res.json({ success: true, artist: row });
        }
    });
});

app.get('/api/artists/user/:userId', (req, res) => {
    db.get('SELECT * FROM artists WHERE userId = ?', [req.params.userId], (err, artist) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error fetching artist', error: err.message });
        } else {
            if (artist) {
                res.json({ success: true, artist });
            } else {
                res.status(404).json({ success: false, message: 'Artist not found' });
            }
        }
    });
});

// Artworks
app.get('/api/artworks', (req, res) => {
    db.all('SELECT * FROM artworks', [], (err, rows) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error fetching artworks', error: err.message });
        } else {
            res.json({ success: true, artworks: rows });
        }
    });
});

app.get('/api/artworks/:id', (req, res) => {
    db.get('SELECT * FROM artworks WHERE id = ?', [req.params.id], (err, artwork) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error fetching artwork', error: err.message });
        } else if (!artwork) {
            res.status(404).json({ success: false, message: 'Artwork not found' });
        } else {
            // Get artwork images
            db.all('SELECT * FROM artwork_images WHERE artworkId = ?', [req.params.id], (err, images) => {
                if (err) {
                    res.status(500).json({ success: false, message: 'Error fetching artwork images', error: err.message });
                } else {
                    artwork.images = images;
                    res.json({ success: true, artwork });
                }
            });
        }
    });
});

app.get('/api/artists/:artistId/artworks', async (req, res) => {
    try {
        // Get artworks by artist ID
        const artworks = await db.all('SELECT * FROM artworks WHERE artistId = ?', [req.params.artistId]);
        
        // Get images for each artwork
        const artworksWithImages = await Promise.all(artworks.map(async (artwork) => {
            const images = await db.all('SELECT * FROM artwork_images WHERE artworkId = ?', [artwork.id]);
            return { ...artwork, images };
        }));
        
        res.json({ success: true, artworks: artworksWithImages });
    } catch (error) {
        console.error('Error getting artworks by artist ID:', error);
        res.status(500).json({ success: false, message: 'Error fetching artist artworks', error: error.message });
    }
});

// Upload artwork with images
app.post('/api/artworks', upload.array('images', 5), (req, res) => {
    const { 
        title, description, category, medium, dimensions, 
        year, price, salePrice, quantity, tags, artistId 
    } = req.body;
    
    const createdAt = new Date().toISOString();
    
    db.run(
        `INSERT INTO artworks 
        (title, description, category, medium, dimensions, year, price, salePrice, quantity, tags, artistId, status, views, likes, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, category, medium, dimensions, year, price, salePrice, quantity, tags, artistId, 'available', 0, 0, createdAt, createdAt],
        function(err) {
            if (err) {
                res.status(500).json({ success: false, message: 'Error creating artwork', error: err.message });
            } else {
                const artworkId = this.lastID;
                
                // Handle uploaded images
                if (req.files && req.files.length > 0) {
                    const imageInsertPromises = req.files.map((file, index) => {
                        return new Promise((resolve, reject) => {
                            const imagePath = 'uploads/' + file.filename;
                            db.run(
                                `INSERT INTO artwork_images (artworkId, imagePath, isMain, createdAt) VALUES (?, ?, ?, ?)`,
                                [artworkId, imagePath, index === 0 ? 1 : 0, createdAt],
                                function(err) {
                                    if (err) reject(err);
                                    else resolve(this.lastID);
                                }
                            );
                        });
                    });
                    
                    Promise.all(imageInsertPromises)
                        .then(imageIds => {
                            res.json({ 
                                success: true, 
                                artwork: { 
                                    id: artworkId, 
                                    title, 
                                    images: imageIds.map((id, index) => ({ 
                                        id, 
                                        imagePath: 'uploads/' + req.files[index].filename 
                                    }))
                                } 
                            });
                        })
                        .catch(err => {
                            res.status(500).json({ success: false, message: 'Error saving artwork images', error: err.message });
                        });
                } else {
                    res.json({ success: true, artworkId });
                }
            }
        }
    );
});

// Upload image for existing artwork
app.post('/api/artworks/:id/images', upload.single('image'), (req, res) => {
    const artworkId = req.params.id;
    
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }
    
    const imagePath = '/uploads/' + req.file.filename;
    const createdAt = new Date().toISOString();
    
    // Check if artwork exists
    db.get('SELECT * FROM artworks WHERE id = ?', [artworkId], (err, artwork) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error checking artwork', error: err.message });
        } else if (!artwork) {
            res.status(404).json({ success: false, message: 'Artwork not found' });
        } else {
            // Check if this is the first image (make it main)
            db.get('SELECT COUNT(*) as count FROM artwork_images WHERE artworkId = ?', [artworkId], (err, result) => {
                if (err) {
                    res.status(500).json({ success: false, message: 'Error checking artwork images', error: err.message });
                } else {
                    const isMain = result.count === 0 ? 1 : 0;
                    
                    db.run(
                        `INSERT INTO artwork_images (artworkId, imagePath, isMain, createdAt) VALUES (?, ?, ?, ?)`,
                        [artworkId, imagePath, isMain, createdAt],
                        function(err) {
                            if (err) {
                                res.status(500).json({ success: false, message: 'Error saving artwork image', error: err.message });
                            } else {
                                res.json({ 
                                    success: true, 
                                    image: { 
                                        id: this.lastID, 
                                        artworkId, 
                                        imagePath, 
                                        isMain 
                                    } 
                                });
                            }
                        }
                    );
                }
            });
        }
    });
});

// Create artist profile with images
app.post('/api/artists/create', upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
    try {
        const artistData = JSON.parse(req.body.artistData);
        
        // Validate required fields
        if (!artistData.userId || !artistData.displayName || !artistData.bio || !artistData.location) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Check if user exists
        const user = await db.get('SELECT * FROM users WHERE id = ?', [artistData.userId]);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if artist already exists for this user
        const existingArtist = await db.get('SELECT * FROM artists WHERE userId = ?', [artistData.userId]);
        if (existingArtist) {
            return res.status(400).json({ message: 'Artist profile already exists for this user' });
        }
        
        // Process uploaded images
        let profileImagePath = null;
        let coverImagePath = null;
        
        if (req.files && req.files.profileImage) {
            profileImagePath = req.files.profileImage[0].path.replace(/\\/g, '/');
        }
        
        if (req.files && req.files.coverImage) {
            coverImagePath = req.files.coverImage[0].path.replace(/\\/g, '/');
        }
        
        // Insert artist into database
        const result = await db.run(
            `INSERT INTO artists (userId, displayName, bio, location, website, specialties, profileImage, coverImage)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                artistData.userId,
                artistData.displayName,
                artistData.bio,
                artistData.location,
                artistData.website,
                artistData.specialties,
                profileImagePath,
                coverImagePath
            ]
        );
        
        // Update user to mark as artist
        await db.run('UPDATE users SET isArtist = 1 WHERE id = ?', [artistData.userId]);
        
        // Get the created artist
        const artist = await db.get('SELECT * FROM artists WHERE id = ?', [result.lastID]);
        
        res.status(201).json({
            message: 'Artist profile created successfully',
            artist: artist
        });
    } catch (error) {
        console.error('Error creating artist profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`ArtGalleria server running at http://localhost:${port}`);
});
