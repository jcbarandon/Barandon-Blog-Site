const Blog = require('../models/blog');

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

// Create blog (image/PDF, if any, was already uploaded client-side straight
// to Cloudinary — see public/upload.js — so req.body.image is a URL, not a file)
const blog_create_post = (req, res) => {
  const blog = new Blog({
    title: req.body.title,
    snippet: req.body.snippet,
    body: req.body.body,
    image: req.body.image || null,
    fileType: req.body.fileType || null,
    thumbnail: req.body.thumbnail || null,
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

// Update blog (optionally replace image or PDF, uploaded client-side as above)
const blog_edit_post = (req, res) => {
  const id = req.params.id;

  const updatedBlog = {
    title: req.body.title,
    snippet: req.body.snippet,
    body: req.body.body
  };

  if (req.body.date) {
    updatedBlog.publishDate = new Date(req.body.date);
  }

  if (req.body.image) {
    updatedBlog.image = req.body.image;
    updatedBlog.fileType = req.body.fileType || null;
    updatedBlog.thumbnail = req.body.thumbnail || null;
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
