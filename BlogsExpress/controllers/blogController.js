const path = require('path');
const Blog = require('../models/blog');
const generatePdfThumbnail = require('../utils/pdfThumbnail');

const uploadsDir = path.join(__dirname, '../public/uploads');

// Renders a PNG preview of a PDF's first page. Returns null (and logs)
// if generation fails, so a bad/corrupt PDF doesn't block the blog save.
const maybeGeneratePdfThumbnail = async (file) => {
  if (!file || file.mimetype !== 'application/pdf') return null;

  try {
    return await generatePdfThumbnail(path.join(uploadsDir, file.filename), uploadsDir);
  } catch (err) {
    console.log('PDF thumbnail generation failed:', err);
    return null;
  }
};

// Show all blogs
const blog_index = (req, res) => {
  Blog.find().sort({ publishDate: -1 })
    .then(result => {
      res.render('index', { blogs: result, title: 'All blogs' });
    })
    .catch(err => console.log(err));
};

// Blog details
const blog_details = (req, res) => {
  const id = req.params.id;
  Blog.findById(id)
    .then(result => {
      res.render('details', { blog: result, title: 'Blog Details' });
    })
    .catch(err => {
      console.log(err);
      res.status(404).render('404', { title: 'Blog not found' });
    });
};

// Create form
const blog_create_get = (req, res) => {
  res.render('create', { title: 'Create a new blog' });
};

// Create blog (with optional image or PDF)
const blog_create_post = async (req, res) => {
  const thumbnail = await maybeGeneratePdfThumbnail(req.file);

  const blog = new Blog({
    title: req.body.title,
    snippet: req.body.snippet,
    body: req.body.body,
    image: req.file ? req.file.filename : null,
    thumbnail,
    publishDate: req.body.date ? new Date(req.body.date) : Date.now()
  });

  blog.save()
    .then(() => res.redirect('/blogs'))
    .catch(err => console.log(err));
};

// Delete blog
const blog_delete = (req, res) => {
  const id = req.params.id;
  Blog.findByIdAndDelete(id)
    .then(() => res.json({ redirect: '/blogs' }))
    .catch(err => console.log(err));
};

// Edit form
const blog_edit_get = (req, res) => {
  const id = req.params.id;
  Blog.findById(id)
    .then(result => {
      res.render('edit', { blog: result, title: 'Edit Blog' });
    })
    .catch(err => {
      console.log(err);
      res.status(404).render('404', { title: 'Blog not found' });
    });
};

// Update blog (optionally replace image or PDF)
const blog_edit_post = async (req, res) => {
  const id = req.params.id;

  const updatedBlog = {
    title: req.body.title,
    snippet: req.body.snippet,
    body: req.body.body
  };

  if (req.body.date) {
    updatedBlog.publishDate = new Date(req.body.date);
  }

  if (req.file) {
    updatedBlog.image = req.file.filename;
    updatedBlog.thumbnail = await maybeGeneratePdfThumbnail(req.file);
  }

  Blog.findByIdAndUpdate(id, updatedBlog)
    .then(() => res.redirect(`/blogs/${id}`))
    .catch(err => console.log(err));
};

module.exports = {
  blog_index,
  blog_details,
  blog_create_get,
  blog_create_post,
  blog_delete,
  blog_edit_get,
  blog_edit_post
};
