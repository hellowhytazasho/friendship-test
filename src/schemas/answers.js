const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const Schema = mongoose.Schema;

const modelSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  questionId: {
    type: ObjectId,
    required: true,
  },
  variants: {
    type: Array,
    default: [],
  },
})
  
module.exports =  mongoose.model('answers', modelSchema);
