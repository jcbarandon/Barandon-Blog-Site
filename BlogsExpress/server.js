require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const blogRoutes = require('./routes/blogRoutes');


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

//connect to mongodb
const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
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
  })
  .catch((err) => console.log('❌ DB connection failed:', err));


// register view engine
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

// routes
app.get('/', (req, res) => {
  res.redirect('/blogs');
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

// blog routes
app.use('/blogs', blogRoutes);

// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});