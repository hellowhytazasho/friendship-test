const { Package } = require('../model/package');
const { getPackageHistory } = require('./get-package-history.service');
// eslint-disable-next-line no-unused-vars
const { updateDeliveryStatus } = require('../helpers/change-delivered-status');
require('../helpers/update-package');
const { HttpError } = require('../errors');

const MIN_PACKAGE_NUMBER_LENGTH = 5;

async function getPackages(userId) {
  const data = await Package.find({ userId }).lean();
  return data;
}

async function addPackage(userId, { packageNumber, packageName }) {
  if (packageNumber.length >= MIN_PACKAGE_NUMBER_LENGTH) {
    const packageEvents = await getPackageHistory(packageNumber);
    try {
      await Package.create({
        userId,
        packageName,
        packageNumber,
        lastUpdate: new Date(),
        notification: false,
        ...packageEvents,
      });
      updateDeliveryStatus();
      return packageEvents;
    } catch (error) {
      if (error.message.startsWith('E11000')) {
        error.message = 'User already has this track code';
      }
      throw new HttpError({
        message: error.message,
        code: 409,
      });
    }
  }

  throw new HttpError({
    message: 'Track code not valid',
    code: 400,
  });
}

async function deletePackage(userId, trackNumber) {
  await Package.deleteOne({ userId, packageNumber: trackNumber });
  return true;
}

async function changePackageName(userId, packageNumber, { newPackageName }) {
  await Package.updateOne({
    userId,
    packageNumber,
  }, {
    $set: {
      packageName: newPackageName,
    },
  });
  return true;
}

async function changeDeliveredStatus(userId, packageNumber) {
  await Package.updateOne({
    userId,
    packageNumber,
  }, {
    $set: {
      deliveredStatus: 1,
    },
  });
  return true;
}

async function changeNotificationStatus(userId, packageNumber, status) {
  await Package.updateOne({
    userId,
    packageNumber,
  }, {
    $set: {
      // eslint-disable-next-line no-unneeded-ternary
      notification: status === 'true',
    },
  });
  return true;
}

module.exports = {
  getPackages,
  addPackage,
  deletePackage,
  changePackageName,
  changeDeliveredStatus,
  changeNotificationStatus,
};
