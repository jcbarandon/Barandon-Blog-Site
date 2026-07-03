require('dotenv').config();
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const blogRoutes = require('./routes/blogRoutes');
const authRoutes = require('./routes/authRoutes');

// express app
const app = express();

// Safety net: some async work (e.g. PDF thumbnail rendering) can throw after
// its own promise chain has already resolved, which Node treats as an
// uncaught exception and would otherwise kill the whole process/site over
// one bad request. Log it and keep serving other requests instead.
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception (server kept running):', err);
});
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled rejection (server kept running):', err);
});

// Connect to MongoDB. Mongoose buffers queries made before the connection
// finishes, so routes can be registered immediately below without waiting
// on this promise — required for serverless (Vercel) where there's no
// "startup" phase to block on. Guarded so a warm serverless container
// doesn't try to reconnect on every invocation.
function connectDB() {
  if (mongoose.connection.readyState === 0) {
    mongoose.connect(process.env.MONGO_URI)
      .then(() => console.log('✅ Connected to MongoDB'))
      .catch((err) => console.log('❌ DB connection failed:', err));
  }
}
connectDB();

// register view engine — resolved relative to this file, not process.cwd(),
// since on Vercel the working directory (/var/task) doesn't match where the
// files actually get placed (/var/task/BlogsExpress/...).
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan('dev'));
app.use((req, res, next) => {
  res.locals.path = req.path;
  res.locals.isAuthed = req.signedCookies && req.signedCookies.auth === 'true';
  // Cloud name is not secret — it's already public in every Cloudinary
  // asset URL. The upload preset is unsigned by design (see uploadBlogFile
  // in public/upload.js), scoped to specific formats/folder server-side.
  res.locals.cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
  res.locals.cloudinaryUploadPreset = 'barandon_blog_unsigned';
  next();
});

// routes
app.get('/', (req, res) => {
  res.redirect('/blogs');
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

app.use('/', authRoutes);
app.use('/blogs', blogRoutes);

// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});

// Only start a listening server when run directly (local dev). On Vercel,
// api/index.js imports `app` as a serverless request handler instead.
if (require.main === module) {
  const server = app.listen(3000, () => {
    console.log('🚀 Server is running on http://localhost:3000');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log('❌ Port 3000 is already in use. Stop the other process and try again.');
    } else {
      console.log('❌ Server failed to start:', err);
    }
    process.exit(1);
  });
}

module.exports = app;
