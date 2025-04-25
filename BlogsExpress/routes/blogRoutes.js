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
const upload = multer({ storage: storage });

// Routes
router.get('/create', blogController.blog_create_get);
router.get('/', blogController.blog_index);
router.post('/', upload.single('image'), blogController.blog_create_post);
router.get('/:id', blogController.blog_details);
router.delete('/:id', blogController.blog_delete);
router.get('/:id/edit', blogController.blog_edit_get);
router.post('/:id/edit', upload.single('image'), blogController.blog_edit_post);

module.exports = router;
