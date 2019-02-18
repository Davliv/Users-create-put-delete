
const mongoose = require('mongoose');
const Settings = require('./settings');
const keygen = require('keygenerator');


function generateAPIKey() {
    return (keygen._({ length: 2 }) + '-' + keygen._({ length: 6 })
        + '-' + keygen.number()
        + '-' + keygen._({ length: 6 })
        + '-' + keygen._({ length: 8 })).replace(/&/g, '');
}

const PhotosSchema = new mongoose.Schema({
    image:{ data: Buffer, contentType: String },
    userId: { type:mongoose.Schema.Types.ObjectId },
    //entity_id: { type: Schema.ObjectId, index: true }
});


const UserSchema = new mongoose.Schema( {
  username: {
    type: String,
    minlength: Settings.Config.username_minlength,
    maxlength: Settings.Config.username_maxlength
  },
  password: {
    type: String,
    minlength: Settings.Config.password_minlength,
    maxlength: Settings.Config.password_maxlength
  },
  key: {
      type: String,
      default: generateAPIKey,
      index: {unique: true}
  },
  avatar: {
    type: String,
    default: null,
    required: false
  },
  email:  String,
  age: Number
});
module.exports = UserSchema;
