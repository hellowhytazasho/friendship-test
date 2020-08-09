const { Package } = require('../model/package');
const { getPackageHistory } = require('./get-package-history.service');

const MIN_PACKAGE_NUMBER_LENGTH = 5;

async function getPackages(userId) {
  const data = await Package.find({ userId }).lean();
  return data;
}

async function addPackage(data) {
  if (data.packageNumber.length >= MIN_PACKAGE_NUMBER_LENGTH) {
    const packageEvents = await getPackageHistory(data.packageNumber);
    const userNumber = await data.userId;

    const packageData = await new Package({
      userId: userNumber,
      packageNumber: data.packageNumber,
      isNewPackage: true,
      lastUpdate: new Date(),
      history: packageEvents,
    });
    await packageData.save();
    return true;
  }

  throw new Error('Track code not valid');
}

async function deletePackage(userId, trackNumber) {
  await Package.deleteOne({ packageNumber: trackNumber });
  return true;
}

module.exports = {
  getPackages,
  addPackage,
  deletePackage,
};
