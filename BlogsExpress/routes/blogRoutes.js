const express = require('express');
const blogController = require('../controllers/blogController');
const multer = require('multer');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

// Files are kept in memory (not written to local disk) since the controller
// uploads them straight to Cloudinary — required for Vercel, whose
// filesystem is read-only/ephemeral outside of /tmp.
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

const upload = multer({
  storage: multer.memoryStorage(),
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

// Note: '/create' and '/:id/edit' must stay registered before the generic
// '/:id' route below, or Express would match them as an :id value instead.

// Public (read-only) routes
router.get('/', blogController.blog_index);

// Admin-only routes
router.get('/create', requireAuth, blogController.blog_create_get);
router.post('/', requireAuth, uploadImage, blogController.blog_create_post);
router.get('/:id/edit', requireAuth, blogController.blog_edit_get);
router.post('/:id/edit', requireAuth, uploadImage, blogController.blog_edit_post);
router.delete('/:id', requireAuth, blogController.blog_delete);

// Public (read-only) route — must come after '/create' and '/:id/edit'
router.get('/:id', blogController.blog_details);

module.exports = router;
