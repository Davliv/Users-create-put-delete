const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let PhotosSchema = new Schema({
    image: Buffer,
    content_type: String,
    mime: String,
    size: Number,
    width: Number,
    height: Number,
    user_id: { type: Schema.ObjectId },
    entity_id: { type: Schema.ObjectId, index: true }
});

module.exports = PhotosSchema;
