const mongoose = require('mongoose'); 

const Schema = mongoose.Schema;

const modelSchema = new Schema({
  color: {
    type: Array,
    default: [],
  },
  question: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
  answers: {
    type: [{
      text: String,
      emoji: String,
    }],
    default: [],
  },
},
{ versionKey: false }
);

modelSchema.virtual('id').get(function(){
  return this._id.toHexString();
});

modelSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('questions', modelSchema);
