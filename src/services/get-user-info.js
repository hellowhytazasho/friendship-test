const UserInfo = require('../schemas/user-info');

async function getUserHistory(userId) {
  const data = await UserInfo.find({userId}).lean();
  return data;
}

async function setUser(data) {
  let tracNumber =  data.packageTrackingNumber;
  const packageStatus = 'Прибыла в пункт назначения';
  const userAnswer = new UserInfo({userId: data.userId, packageTrackingNumber: { trackingNumber: tracNumber, packagePlaceStatus: packageStatus }})
  userAnswer.save();
  return packageStatus;
}

module.exports = {
  getUserHistory,  
  setUser,
}
