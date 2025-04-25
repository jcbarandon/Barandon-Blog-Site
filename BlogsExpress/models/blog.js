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
  }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
