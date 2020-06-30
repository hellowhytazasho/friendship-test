const mongoose = require('mongoose'); 

const { ObjectId } = mongoose.Types;

const Schema = mongoose.Schema;

const modelSchema = new Schema({
  questionId: {
    type: Number,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  variants: {
    type: Array,
    default: [],
  },
  emoji: {
    type: Array,
    default: [],
  },
  cardColor: {
    type: Array,
    default: [],
  }
})

module.exports = mongoose.model('questions', modelSchema);
