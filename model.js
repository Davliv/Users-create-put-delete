const mongoose = require('mongoose');
const Userchema = new mongoose.Schema({
  username:{
    type: String
  },
  password: {
    type: String
  },
  email: {
    type: String
  },
  age: {
    type: Number
  }
});
module.exports = Userchema;
