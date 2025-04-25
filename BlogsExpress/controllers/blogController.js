const Blog = require('../models/blog');

// Show all blogs
const blog_index = (req, res) => {
  Blog.find().sort({ createdAt: -1 })
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

// Create blog (with optional image)
const blog_create_post = (req, res) => {
  const blog = new Blog({
    title: req.body.title,
    snippet: req.body.snippet,
    body: req.body.body,
    image: req.file ? req.file.filename : null
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

// Update blog (optionally replace image)
const blog_edit_post = (req, res) => {
  const id = req.params.id;

  const updatedBlog = {
    title: req.body.title,
    snippet: req.body.snippet,
    body: req.body.body
  };

  if (req.file) {
    updatedBlog.image = req.file.filename;
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
