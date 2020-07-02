const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const Schema = mongoose.Schema;

const modelSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  answer: {
    type: [{
      _id: false,
      questionId: ObjectId,
      answerId: ObjectId,
    }],
  },
},
{ versionKey: false }
);
  
module.exports =  mongoose.model('answers', modelSchema);
