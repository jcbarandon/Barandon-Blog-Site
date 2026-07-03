const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  snippet: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  image: {
    type: String, // filename only, not the full path
    required: false
  },
  thumbnail: {
    type: String, // generated first-page preview image for PDF uploads
    required: false
  },
  // User-editable "published on" date shown throughout the site. Kept
  // separate from Mongoose's own createdAt, which it protects from being
  // changed after a document is first created.
  publishDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
