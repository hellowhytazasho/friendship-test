const mongoose = require('mongoose'); 
require('dotenv').config()


const url = process.env.DB_URL;

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
