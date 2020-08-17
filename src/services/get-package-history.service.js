const axios = require('axios');
const config = require('config');

const { token, endpoint } = config.track24;

const FELLS = [
  'trackCreationDateTime',
  'trackUpdateDateTime',
  'trackUpdateDiffMinutes',
  'trackDeliveredDateTime',
  'fromCountryCode',
  'fromCountry',
  'fromName',
  'destinationName',
  'destinationCountryCode',
  'destinationCountry',
  'destinationPostalCode',
  'fromCity',
  'destinationCity',
  'fromAddress',
  'destinationAddress',
  'collectOnDeliveryPrice',
  'declaredValue',
  'deliveredStatus',
  'trackCodeModified',
  'awaiting',
  'events',
];

async function getPackageHistory(packageNumber) {
  const saveData = {};
  const url = `${endpoint}?apiKey=${token}&domain=demo.track24.ru&pretty=true&code=${packageNumber}`;
  const resp = await axios.get(url);
  const resData = resp.data.data;

  FELLS.forEach((f) => {
    saveData[f] = resData[f];
  });

  return saveData;
}

module.exports = {
  getPackageHistory,
};
