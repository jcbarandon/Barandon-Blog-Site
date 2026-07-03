const express = require('express');
const blogController = require('../controllers/blogController');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

// Note: '/create' and '/:id/edit' must stay registered before the generic
// '/:id' route below, or Express would match them as an :id value instead.

// Public (read-only) routes
router.get('/', blogController.blog_index);

// Admin-only routes. Files are uploaded directly from the browser to
// Cloudinary (see public/upload.js) — these routes just receive the
// resulting URL as a normal form field, no file ever passes through here.
router.get('/create', requireAuth, blogController.blog_create_get);
router.post('/', requireAuth, blogController.blog_create_post);
router.get('/:id/edit', requireAuth, blogController.blog_edit_get);
router.post('/:id/edit', requireAuth, blogController.blog_edit_post);
router.delete('/:id', requireAuth, blogController.blog_delete);

// Public (read-only) route — must come after '/create' and '/:id/edit'
router.get('/:id', blogController.blog_details);

module.exports = router;
