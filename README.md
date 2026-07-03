# Barandon Blog Site

A simple blog application built with Express, EJS, and MongoDB. Users can create, view, edit, and delete blog posts, each with a title, snippet, body text, and an optional image.

## Tech Stack

- [Express 5](https://expressjs.com/) – web framework
- [EJS](https://ejs.co/) – server-rendered templating
- [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) – database and ODM
- [Multer](https://github.com/expressjs/multer) – image upload handling
- [Morgan](https://github.com/expressjs/morgan) – HTTP request logging
- [Nodemon](https://nodemon.io/) – dev auto-reload

## Project Structure

```
BlogsExpress/
├── controllers/     # Route handler logic
├── models/          # Mongoose schemas (Blog)
├── routes/          # Express routers
├── views/           # EJS templates (index, details, create, edit, 404, about)
│   └── partials/    # Shared head/nav/footer includes
├── public/          # Static assets (CSS, uploaded images)
└── server.js         # App entry point
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- A MongoDB connection string (e.g. from [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
cd BlogsExpress
npm install
```

### Configuration

The app connects to MongoDB using a connection string in `server.js`. Move this into an environment variable before running the app:

```bash
# BlogsExpress/.env
MONGO_URI=your-mongodb-connection-string
```

> **Note:** `server.js` currently has a MongoDB URI hardcoded directly in the file. Since it contains live database credentials, it should be replaced with `process.env.MONGO_URI` (via a package like `dotenv`) and removed from version history.

### Running the app

```bash
# development (auto-restart on changes)
npm run dev

# production
npm start
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Features

- List all blog posts (`/blogs`)
- View a single post (`/blogs/:id`)
- Create a new post with an image upload (`/blogs/create`)
- Edit an existing post (`/blogs/:id/edit`)
- Delete a post
- Static "About" page (`/about`)
- Custom 404 page

## License

ISC
