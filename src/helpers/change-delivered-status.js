const { Package } = require('../model/package');

async function updateDeliveryStatus() {
  await Package.updateMany({
    deliveredStatus: 0,
    $or:
    [
      { 'events.operationAttributeOriginal': 'Вручение получателю' },
      { 'events.operationAttributeOriginal': 'Вручение отправителю' },
      { 'events.operationAttributeOriginal': 'Прибыло в место вручения' },
      { 'events.operationAttributeOriginal': 'Вручение адресату' },
      { 'events.operationAttributeOriginal': 'Выдано получателю' },
      { 'events.operationAttributeOriginal': 'Доставка не удалась' },
      { 'events.operationAttributeOriginal': 'Конфисковано таможней' },
    ],
  }, {
    $set: {
      deliveredStatus: 1,
    },
  });
}

module.exports = {
  updateDeliveryStatus,
};
