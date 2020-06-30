const mongoose = require('mongoose'); 

let Schema = mongoose.Schema;

let modelSchema = new Schema({
  user_name: {type: String},
  questions: {
    question1: String,
    question2: String,
  }
})

module.exports =  mongoose.model('User-answers', modelSchema);