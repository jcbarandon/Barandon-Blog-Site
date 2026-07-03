const express = require('express');
const blogController = require('../controllers/blogController');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1714071978293.jpg
  }
});
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, GIF, WEBP images or PDF files are allowed'));
    }
  }
});

// Wraps multer so upload errors (bad file type, too large) show a message
// instead of crashing the request with an unhandled error.
const uploadImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).send(
        `<p>Upload failed: ${err.message}. <a href="javascript:history.back()">Go back</a></p>`
      );
    }
    next();
  });
};

// Routes
router.get('/create', blogController.blog_create_get);
router.get('/', blogController.blog_index);
router.post('/', uploadImage, blogController.blog_create_post);
router.get('/:id', blogController.blog_details);
router.delete('/:id', blogController.blog_delete);
router.get('/:id/edit', blogController.blog_edit_get);
router.post('/:id/edit', uploadImage, blogController.blog_edit_post);

module.exports = router;
