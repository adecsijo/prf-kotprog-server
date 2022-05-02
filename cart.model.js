const mongoose = require('mongoose');

var cartSchema = new mongoose.Schema({
  username: {type: String, required: true},
  items: [{
    ISBN: {type: String, required: true, unique: true},
    title: {type: String, required: true},
    author: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true}
  }],
  total: {type: Number, required: true}
}, {collection: 'cart'});

mongoose.model('cart', cartSchema);