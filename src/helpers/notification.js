const config = require('config');
const axios = require('axios');
const logger = require('../logger')('not');
const { Package } = require('../model/package');

const { notificationKey } = config.vkApp;

async function sendNotification(data) {
  data.forEach(async (elem) => {
    let packageInfo = '';
    if (elem.packageName === undefined) {
      packageInfo = elem.packageNumber;
    } else {
      // eslint-disable-next-line no-unused-vars
      packageInfo = elem.packageName;
    }

    const upData = await Package.find({
      userId: elem.userId,
      packageNumber: elem.packageNumber,
    }).lean();

    const dataArray = upData[0].events;

    const event = dataArray[dataArray.length - 1];
    const { operationAttributeOriginal } = event;

    const message = `${packageInfo}: ${operationAttributeOriginal}`;
    const url = `https://api.vk.com/method/notifications.sendMessage?user_ids=${elem.userId}&message=${encodeURIComponent(message)}&access_token=${notificationKey}&v=5.122`;
    const resp = await axios.get(url);
    const respData = resp.data;
    logger.info(`Send notification to: ${elem.userId}. Status: ${respData}`);
  });
}

module.exports = sendNotification;
