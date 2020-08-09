const { Package } = require('../model/package');
const { getPackageHistory } = require('./get-package-history.service');

const MIN_PACKAGE_NUMBER_LENGTH = 5;

async function getPackages(userId) {
  const data = await Package.find({ userId }).lean();
  return data;
}

async function addPackage({ packageNumber, userId, packageName }) {
  if (packageNumber.length >= MIN_PACKAGE_NUMBER_LENGTH) {
    const packageEvents = await getPackageHistory(packageNumber);
    const userNumber = await userId;

    const packageData = await new Package({
      userId: userNumber,
      packageNumber,
      packageName,
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
