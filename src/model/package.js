const mongoose = require('mongoose');

const { Schema } = mongoose;

const SchemaDefinition = {
  userId: {
    type: String,
    required: true,
  },
  packageNumber: String,
  packageName: String,
  isNewPackage: Boolean,
  lastUpdate: Date,
  history: {
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

PackagesSchema.index({ packageNumber: 1 }, { unique: true });

const Package = mongoose.model('package', PackagesSchema);

module.exports = { SchemaDefinition, PackagesSchema, Package };
