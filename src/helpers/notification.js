const config = require('config');
const axios = require('axios');
const logger = require('../logger')('not');
const { Package } = require('../model/package');

const { notificationKey } = config.vkApp;

async function sendNotification(data) {
  let packageInfo = '';
  let message = '';
  if (data.packageName === undefined) {
    packageInfo = data.packageNumber;
  } else {
    packageInfo = data.packageName;
  }
  const upData = await Package.find({
    userId: data.userId,
    packageNumber: data.packageNumber,
  }).lean();

  const dataArray = upData[0].events;
  const event = dataArray[dataArray.length - 1];
  const { operationAttributeOriginal } = event;

  if (operationAttributeOriginal.indexOf('Track24.ru') !== -1) {
    const text = 'Трек-код внесен в базу для автоматического мониторинга.';
    message = `${packageInfo}: ${text}`;
  } else {
    message = `${packageInfo}: ${operationAttributeOriginal}`;
  }
  const url = `https://api.vk.com/method/notifications.sendMessage?user_ids=${data.userId}&message=${encodeURIComponent(message)}&access_token=${notificationKey}&v=5.122`;
  const resp = await axios.get(url);
  const respData = resp.data;
  logger.info(respData);
}

module.exports = sendNotification;
