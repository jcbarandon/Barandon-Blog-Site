const Blog = require('../models/blog');
const generatePdfThumbnail = require('../utils/pdfThumbnail');
const { uploadBuffer } = require('../utils/cloudinary');

// Uploads the submitted file (image or PDF) to Cloudinary and, for PDFs,
// also generates and uploads a first-page preview image. Returns
// { image, fileType, thumbnail }, all null if there's no file. A failed
// thumbnail render doesn't block the upload — it just falls back to no
// thumbnail (see views, which show a placeholder badge in that case).
const uploadBlogFile = async (file) => {
  if (!file) return { image: null, fileType: null, thumbnail: null };

  const isPdf = file.mimetype === 'application/pdf';

  const mainUpload = await uploadBuffer(file.buffer, {
    resource_type: isPdf ? 'raw' : 'image',
    folder: 'barandon-blog'
  });

  let thumbnail = null;
  if (isPdf) {
    try {
      const thumbBuffer = await generatePdfThumbnail(file.buffer);
      const thumbUpload = await uploadBuffer(thumbBuffer, {
        resource_type: 'image',
        folder: 'barandon-blog'
      });
      thumbnail = thumbUpload.secure_url;
    } catch (err) {
      console.log('PDF thumbnail generation failed:', err);
    }
  }

  return { image: mainUpload.secure_url, fileType: isPdf ? 'pdf' : 'image', thumbnail };
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
  const { image, fileType, thumbnail } = await uploadBlogFile(req.file);

  const blog = new Blog({
    title: req.body.title,
    snippet: req.body.snippet,
    body: req.body.body,
    image,
    fileType,
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
    const { image, fileType, thumbnail } = await uploadBlogFile(req.file);
    updatedBlog.image = image;
    updatedBlog.fileType = fileType;
    updatedBlog.thumbnail = thumbnail;
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
