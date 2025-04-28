# ArtGalleria - Collaborative Art Marketplace

🎨ArtGalleria is a web application that allows artists to showcase and sell their artwork to art enthusiasts around the world.

## Features

- User authentication (login, register, profile management)
- Artist profiles and dashboards
- Artwork upload and management
- Image storage with SQLite database
- Gallery browsing and filtering
- Shopping cart and checkout functionality

## Technical Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: SQLite
- File Storage: Local file system (uploads directory)

## Setup and Installation

1. Make sure you have Node.js installed (version 14 or higher recommended)
2. Clone or download this repository
3. Open a terminal in the project directory
4. Install dependencies:

```bash
npm install
```

5. Start the server:

```bash
npm start
```

6. Open your browser and navigate to http://localhost:3000

## Image Upload Functionality

The application now supports image uploads with SQLite database storage. Images are stored in the `uploads` directory, and their metadata is stored in the SQLite database.

### Database Schema

The SQLite database includes the following tables:

- `users` - User information
- `artists` - Artist profiles
- `artworks` - Artwork details
- `artwork_images` - Images associated with artworks
- `exhibitions` - Art exhibitions
- `orders` - Customer orders
- `order_items` - Items in customer orders

### Data Migration

The application includes a data migration endpoint that can transfer data from the previous JSON-based storage to the new SQLite database. To migrate your data, navigate to http://localhost:3000/api/migrate after starting the server.

## Development

To run the application in development mode with automatic reloading:

```bash
npm run dev
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
