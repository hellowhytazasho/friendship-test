const mongoose = require('mongoose'); 

let Schema = mongoose.Schema;

let modelSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  packageTrackingNumber: {
    type: {
      _id: false,
      trackingNumber: String,
      packagePlaceStatus: String
    }
  }
},
{ versionKey: false }
)

module.exports =  mongoose.model('User-info', modelSchema);