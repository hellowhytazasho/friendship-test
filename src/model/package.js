const mongoose = require('mongoose');

const { Schema } = mongoose;

const SchemaDefinition = {
  userId: {
    type: String,
    required: true,
  },
  packageNumber: String,
  packageName: String,
  lastUpdate: Date,
  notification: Boolean,
  trackCreationDateTime: String,
  trackUpdateDateTime: String,
  trackUpdateDiffMinutes: Number,
  trackDeliveredDateTime: String,
  fromCountryCode: String,
  fromCountry: String,
  fromName: String,
  destinationName: String,
  destinationCountryCode: String,
  destinationCountry: String,
  destinationPostalCode: String,
  fromCity: String,
  destinationCity: String,
  fromAddress: String,
  destinationAddress: String,
  collectOnDeliveryPrice: String,
  declaredValue: String,
  deliveredStatus: Number,
  trackCodeModified: String,
  awaiting: Boolean,
  events: {
    type: [{
      _id: false,
      eventDateTime: String,
      operationDateTime: String,
      operationType: String,
      operationPlaceName: String,
      serviceName: String,
      operationAttributeOriginal: String,
    }],
  },
};

const PackagesSchema = new Schema(SchemaDefinition, { versionKey: false });

PackagesSchema.index({ packageNumber: 1, userId: 1 }, { unique: true });

const Package = mongoose.model('package', PackagesSchema);

module.exports = { SchemaDefinition, PackagesSchema, Package };
