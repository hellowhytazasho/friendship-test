const crypto = require('crypto');
const qs = require('querystring');
const config = require('config');
const logger = require('../logger')('app');

const { vkApp: { secretKey: VK_APP_SECRET_KEY } } = config;

const PREFIX_LENGTH = 3;

function isAccess(urlParams) {
  const ordered = {};
  Object.keys(urlParams).sort().forEach((key) => {
    if (key.slice(0, PREFIX_LENGTH) === 'vk_') {
      ordered[key] = urlParams[key];
    }
  });

  const stringParams = qs.stringify(ordered);
  const paramsHash = crypto
    .createHmac('sha256', VK_APP_SECRET_KEY)
    .update(stringParams)
    .digest()
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=$/, '');

  logger.info(paramsHash === urlParams.sign);
  if (paramsHash === urlParams.sign) {
    return true;
  }
  return false;
}

module.exports = {
  isAccess,
};
