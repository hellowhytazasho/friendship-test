const mongoose = require('mongoose'); 
const {init} = require('./initialDB')

const url = 'mongodb+srv://tores:1q2w3e4r@cluster0-jylwb.mongodb.net/telegram';

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}).
  catch(error => handleError(error));

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:')); 
db.once('open', function() {
  console.log('DB connect');
});


mongoose.connection.on('error', err => {
  console.error(err);
});
