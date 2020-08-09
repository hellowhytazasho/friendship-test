const axios = require('axios');
const config = require('config');

const { token, endpoint } = config.track24;

async function getPackageHistory(trackNumber) {
  const dataArray = [];
  const url = `${endpoint}?apiKey=${token}&domain=demo.track24.ru&pretty=true&code=${trackNumber}`;
  const resp = await axios.get(url);
  const respData = await resp.data.data.events;
  await respData.forEach((elem) => {
    dataArray.push({
      eventDateTime: elem.eventDateTime,
      operationDateTime: elem.operationDateTime,
      operationType: elem.operationType,
      operationPlaceName: elem.operationPlaceName,
      serviceName: elem.serviceName,
      operationAttributeOriginal: elem.operationAttributeOriginal,
    });
  });
  return dataArray;
}

module.exports = {
  getPackageHistory,
};
