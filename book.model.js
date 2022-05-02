const mongoose = require('mongoose');

var bookSchema = new mongoose.Schema({
  ISBN: {type: String, required: true, unique: true},
  title: {type: String, required: true},
  author: {type: String, required: true},
  description: {type: String, required: true},
  price: {type: Number, required: true}
}, {collection: 'book'});

mongoose.model('book', bookSchema);