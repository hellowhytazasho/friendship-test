// const crypto = require('crypto');
// const qs = require('querystring');
// const logger = require('../logger')('app');

// function isAccess(url) {
//   const urlParams = qs.parse(url);
//   const ordered = {};
//   Object.keys(urlParams).sort().forEach((key) => {
//     if (key.slice(0, 3) === 'vk_') {
//       ordered[key] = urlParams[key];
//     }
//   });

//   const stringParams = qs.stringify(ordered);
//   const paramsHash = crypto
//     .createHmac('sha256', secretKey)
//     .update(stringParams)
//     .digest()
//     .toString('base64')
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_')
//     .replace(/=$/, '');

//   logger.info(paramsHash === urlParams.sign);
// }

// module.exports = {
//   isAccess,
// }
