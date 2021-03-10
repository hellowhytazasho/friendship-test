/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
const { Router } = require('express');
const { addPackage, changePackageName } = require('../../services/packages.service');
const { Package } = require('../../model/package');

const router = Router();

const TWO_WORDS = 2;
const THREE_WORDS = 3;
const FOUR_WORDS = 4;
const PACKAGE_LENGTH = 3;
const BAD_PACKAGE_NUMBER_LENGTH = 4;
const TWO_ELEMENTS = 2;

let tokens = [];
const sessions = {};

function contains(array, find) {
  let count = 0;
  for (const where of array) {
    for (const what of find) {
      if (where.indexOf(what) === 0) count += 1;
    }
  }
  return count;
}

const Activities = {
  TRACK: 0,
  isTrack: () => contains(tokens, ['отследи', 'посыл']) === TWO_WORDS
      || contains(tokens, ['определ', 'посыл']) === TWO_WORDS
      || contains(tokens, ['где', 'посыл']) === TWO_WORDS
      || contains(tokens, ['отслед', 'друг', 'посыл']) === TWO_WORDS,
  TRANSIT: 1,
  DETAIL: 6,
  isTransit: () => contains(tokens, ['какие', 'посыл', 'не', 'достав']) === FOUR_WORDS
      || contains(tokens, ['какие', 'посыл', 'недостав']) === THREE_WORDS
      || contains(tokens, ['какие', 'посыл', 'едут']) === THREE_WORDS
      || contains(tokens, ['сколько', 'посыл', 'в', 'пути']) === FOUR_WORDS,
  NOTIFICATION: 2,
  isNotification: () => contains(tokens, ['включ', 'уведом', 'о', 'посыл']) === FOUR_WORDS
      || contains(tokens, ['уведом', 'о', 'посыл']) === THREE_WORDS,
  NOTIFICATION_INPUT_TRACK: 3,
  NOTIFICATION_ACCEPT: 4,
  RENAME: 5,
  isRename: () => contains(tokens, ['измен', 'назван', 'посыл']) === THREE_WORDS
      || contains(tokens, ['редактир', 'назван', 'посыл']) === THREE_WORDS
      || contains(tokens, ['переимен', 'назван', 'посыл']) === THREE_WORDS
      || contains(tokens, ['переимен', 'посыл']) === TWO_WORDS,
  RENAME_INPUT: 6,
};

router.post('/webhook', async (req, res) => {
  const { body } = req;
  const {
    request,
    session,
    version,
  } = body;
  session.user = { user_id: 123456789 }; // удалить это на проде

  const { session_id } = session;
  const static_required_data = {
    session,
    version,
  };
  const session_payload = sessions[session_id];

  tokens = request.nlu.tokens;

  if (session.user === undefined) {
    res.send({
      response: {
        text: 'Я могу помочь с отслеживанием посылки — переходите в мини-приложение!',
        tts: 'Я могу помочь с отслеживанием посылки — переходите в мини-приложение!',
        card: {
          type: 'MiniApp',
          url: 'https://vk.com/track',
        },
        end_session: true,
      },
      ...static_required_data,
    });
  } else if (Activities.isTrack()) {
    res.send({
      response: {
        text: 'Чтобы отследить посылку, введите трек-номер или название посылки.',
        tts: 'Чтобы отследить посылку, введите трек-номер или название посылки.',
        end_session: false,
      },
      ...static_required_data,
    });
    sessions[session_id] = {
      act: Activities.TRACK,
    };
    return;
  } else if (Activities.isTransit()) {
    const { user_id } = session.user;
    const userPackages = await Package.find({ userId: user_id, deliveredStatus: 0 });
    if (userPackages.length) {
      let message = 'У Вас в пути';
      const packegeWithName = [];

      if (userPackages.length >= PACKAGE_LENGTH) {
        userPackages.forEach((el) => {
          if (el.packageName !== null && el.packageName !== undefined) packegeWithName.push(el);
        });

        if (packegeWithName.length >= PACKAGE_LENGTH) {
          for (let i = 0; i < PACKAGE_LENGTH; i += 1) {
            if (i !== 2) {
              message += ` ${packegeWithName[i].packageName},`;
            } else {
              const remainPack = userPackages.length - PACKAGE_LENGTH;
              let lastWord;
              if (remainPack === 1) {
                lastWord = remainPack === 1 ? 'посылка' : 'посылки';
              } else if (remainPack < 5 && remainPack > 1) {
                lastWord = 'посылки';
              } else {
                lastWord = 'посылок';
              }
              message += ` ${packegeWithName[i].packageName} и еще ${remainPack} ${lastWord}.`;
            }
          }
        } else {
          const lastWord = userPackages.length < 5 && userPackages.length > 1 ? 'посылки' : 'посылок';
          message += ` ${userPackages.length} ${lastWord}.`;
        }
      } else if (userPackages.length === 1) {
        message += ' 1 посылка';
      } else {
        message += ` ${userPackages.length} ${userPackages.length < 5 && userPackages.length > 1 ? 'посылки' : 'посылок'}.`;
      }
      res.send({
        response: {
          text: message,
          tts: message,
          buttons: [{
            title: 'Отследить посылку',
            payload: {
              type: 0,
            },
          },
          ],
          card: {
            type: 'MiniApp',
            url: 'https://vk.com/track',
          },
          end_session: false,
        },
        ...static_required_data,
      });
    } else {
      res.send({
        response: {
          text: 'У Вас нет активных посылок.',
          tts: 'У Вас нет активных посылок.',
          buttons: [{
            title: 'Отследить другую посылку',
            payload: {
              type: 0,
            },
          },
          ],
          end_session: true,
        },
        ...static_required_data,
      });
    }
    delete sessions[session_id];
    return;
  } else if (Activities.isNotification()) {
    res.send({
      response: {
        text: 'Вам нужны уведомления о всех посылках, или о конкретной?',
        tts: 'Вам нужны уведомления о всех посылках, или о конкретной?',
        end_session: false,
        buttons: [{
          title: 'Обо всех',
          payload: {
            type: 0,
          },
        },
        {
          title: 'О конкретной',
          payload: {
            type: 1,
          },
        },
        ],
      },
      ...static_required_data,
    });
    sessions[session_id] = {
      act: Activities.NOTIFICATION,
    };
    return;
  } else if (Activities.isRename()) {
    res.send({
      response: {
        text: 'Введите название посылки, или её трек-номер.',
        tts: 'Введите название посылки, или её трек-номер.',
        end_session: false,
      },
      ...static_required_data,
    });
    sessions[session_id] = {
      act: Activities.RENAME,
    };
    return;
  }

  if (session_payload) {
    if (session_payload.act === Activities.TRACK) {
      if (request.command.length < BAD_PACKAGE_NUMBER_LENGTH && request.command !== 'подробнее') {
        res.send({
          response: {
            text: 'Упс, кажется в трек-номере есть ошибочка.',
            tts: 'Упс, кажется в трек-номере есть ошибочка.',
            buttons: [{
              title: 'Отследить другую посылку',
              payload: {
                type: 0,
              },
            },
            ],
            end_session: true,
          },
          ...static_required_data,
        });
      } else {
        const { user_id } = session.user;
        let packageData = await Package.findOne({ userId: user_id, packageNumber: request.command.toUpperCase() }).exec();
        const packageDataWithName = await Package.find({ userId: user_id });
        let flag = true;

        if (packageData === null) {
          try {
            packageData = await addPackage(user_id, { packageNumber: request.command.toUpperCase() });
            await Package.remove({ userId: user_id, events: { $exists: true, $size: 0 } });
          } catch (error) {
            console.log('err');
          }
        }

        if (!packageData) {
          packageDataWithName.forEach((el) => {
            if (el.packageName !== null && el.packageName !== undefined && el.packageName.toUpperCase() === request.original_utterance.toUpperCase()) {
              const packageEventsLength = el.events.length;
              const lastOperation = el.events[packageEventsLength - 1].operationAttributeOriginal === undefined ? el.events[packageEventsLength - TWO_WORDS].operationAttributeOriginal : el.events[packageEventsLength - 1].operationAttributeOriginal;
              flag = false;
              res.send({
                response: {
                  text: `Последний статус: ${lastOperation}.`,
                  tts: `Последний статус: ${lastOperation}.`,
                  end_session: false,
                  buttons: [{
                    title: 'Подробнее',
                    payload: {
                      type: 0,
                    },
                  },
                  ],
                },
                ...static_required_data,
              });
              sessions[session_id] = {
                act: Activities.DETAIL, trackNumber: el.packageNumber.toUpperCase(),
              };
            }
          });
          if (flag) {
            res.send({
              response: {
                text: 'Я не нашла у Вас посылку с таким именем.',
                tts: 'Я не нашла у Вас посылку с таким именем.',
                buttons: [{
                  title: 'Отследить другую посылку',
                  payload: {
                    type: 0,
                  },
                },
                ],
                end_session: true,
              },
              ...static_required_data,
            });
            delete sessions[session_id];
            return;
          }
          if (!flag) {
            // eslint-disable-next-line consistent-return
            return;
          }
        }

        if (packageData.status === 'error') {
          res.send({
            response: {
              text: 'Трек-код не действителен.',
              tts: 'Трек-код не действителен.',
              buttons: [{
                title: 'Отследить другую посылку',
                payload: {
                  type: 0,
                },
              },
              ],
              end_session: true,
            },
            ...static_required_data,
          });
          delete sessions[session_id];
          return;
        }

        if (packageData.events.length === 1) {
          res.send({
            response: {
              text: 'Я буду внимательно следить за перемещением посылки, а пока что стоит подождать, пока появятся первые данные о перемещении.',
              tts: 'Я буду внимательно следить за перемещением посылки, а пока что стоит подождать, пока появятся первые данные о перемещении.',
              buttons: [{
                title: 'Отследить другую посылку',
                payload: {
                  type: 0,
                },
              },
              ],
              end_session: true,
            },
            ...static_required_data,
          });
          delete sessions[session_id];
          return;
        }

        const packageEventsLength = packageData.events.length;
        const lastOperation = packageData.events[packageEventsLength - 1].operationAttributeOriginal === undefined ? packageData.events[packageEventsLength - TWO_WORDS].operationAttributeOriginal : packageData.events[packageEventsLength - 1].operationAttributeOriginal;

        res.send({
          response: {
            text: `Последний статус: ${lastOperation}.`,
            tts: `Последний статус: ${lastOperation}.`,
            end_session: false,
            buttons: [{
              title: 'Подробнее',
              payload: {
                type: 0,
              },
            },
            ],
          },
          ...static_required_data,
        });
        sessions[session_id] = {
          act: Activities.DETAIL, trackNumber: request.command.toUpperCase(),
        };
      }
    } else if (session_payload.act === Activities.DETAIL) {
      if (request.command === 'подробнее') {
        const packageData = await await Package.findOne({ packageNumber: session_payload.trackNumber }).exec();
        const packageEventsLength = packageData.events.length;
        const { serviceName } = packageData.events[packageEventsLength - 1];
        const deliveredDateTime = packageData.trackDeliveredDateTime === '' ? 'неизвестно' : packageData.trackDeliveredDateTime;

        let lastPlace;
        let lastWeight;
        let lastService;

        if (serviceName === 'Track24') {
          lastPlace = packageData.events[packageEventsLength - TWO_ELEMENTS].operationPlaceNameOriginal === '' ? 'неизвестно' : packageData.events[packageEventsLength - TWO_ELEMENTS].operationPlaceNameOriginal;
          lastWeight = packageData.events[packageEventsLength - TWO_ELEMENTS].itemWeight === '' ? 'неизвестно' : packageData.events[packageEventsLength - TWO_ELEMENTS].itemWeight;
          lastService = packageData.events[packageEventsLength - TWO_ELEMENTS].serviceName === '' ? 'неизвестно' : packageData.events[packageEventsLength - TWO_ELEMENTS].serviceName;
        } else {
          lastPlace = packageData.events[packageEventsLength - 1].operationPlaceNameOriginal;
          lastWeight = packageData.events[packageEventsLength - 1].itemWeight;
          lastService = packageData.events[packageEventsLength - 1].serviceName;
        }

        res.send({
          response: {
            text: `Подробности посылки: \nМаршрут: ${lastPlace} \nВес: ${lastWeight} \nОтправитель: ${lastService} \nПриблизительная дата прибытия: ${deliveredDateTime}.`,
            tts: `Подробности посылки: \nМаршрут: ${lastPlace} \nВес: ${lastWeight} \nОтправитель: ${lastService} \nПриблизительная дата прибытия: ${deliveredDateTime}.`,
            buttons: [{
              title: 'Отследить другую посылку',
              payload: {
                type: 0,
              },
            },
            ],
            end_session: true,
          },
          ...static_required_data,
        });

        delete sessions[session_id];
      } else {
        delete sessions[session_id];
      }
    } else if (session_payload.act === Activities.NOTIFICATION) {
      const { user_id } = session.user;

      if (request.command === 'обо всех') {
        const userPackages = await Package.find({ userId: user_id, deliveredStatus: 0 }).exec();
        if (userPackages) {
          await Package.updateMany({
            userId: user_id,
          }, {
            $set: {
              notification: true,
            },
          });

          res.send({
            response: {
              text: 'Теперь разрешите присылать Вам уведомления в мини-приложении.',
              tts: 'Теперь разрешите присылать Вам уведомления в мини-приложении.',
              card: {
                type: 'MiniApp',
                url: 'https://vk.com/track',
              },
              end_session: true,
            },
            ...static_required_data,
          });

          delete sessions[session_id];
        } else {
          res.send({
            response: {
              text: 'У Вас нет посылок.',
              tts: 'У Вас нет посылок.',
              end_session: true,
            },
            ...static_required_data,
          });

          delete sessions[session_id];
        }
      } else if (request.command === 'о конкретной') {
        res.send({
          response: {
            text: 'Введите трек-номер посылки, или её название.',
            tts: 'Введите трек-номер посылки, или её название.',
            end_session: false,
          },
          ...static_required_data,
        });

        sessions[session_id] = { act: Activities.NOTIFICATION_INPUT_TRACK };
      }
    } else if (session_payload.act === Activities.NOTIFICATION_INPUT_TRACK) {
      const { user_id } = session.user;

      const userPackages = await Package.find({ userId: user_id }).exec();
      let flag = true;

      userPackages.forEach(async (el) => {
        if (el.packageName !== null && el.packageName !== undefined && el.packageName.toUpperCase() === request.original_utterance.toUpperCase()) {
          flag = false;
          res.send({
            response: {
              text: `Подтвердите трек-номер посылки — ${el.packageNumber}.`,
              tts: `Подтвердите трек-номер посылки — ${el.packageNumber}.`,
              end_session: false,
              buttons: [{
                title: 'Верно',
                payload: {
                  type: 0,
                },
              },
              {
                title: 'Отмена',
                payload: {
                  type: 1,
                },
              },
              ],
            },
            ...static_required_data,
          });

          sessions[session_id] = {
            act: Activities.NOTIFICATION_ACCEPT, trackNumber: el.packageNumber,
          };
        }
        if (el.packageNumber.toUpperCase() === request.original_utterance.toUpperCase()) {
          flag = false;

          await Package.updateOne({
            userId: user_id,
            packageNumber: request.original_utterance.toUpperCase(),
          }, {
            $set: {
              notification: true,
            },
          });

          res.send({
            response: {
              text: 'Теперь разрешите присылать Вам уведомления в мини-приложении.',
              tts: 'Теперь разрешите присылать Вам уведомления в мини-приложении.',
              card: {
                type: 'MiniApp',
                url: 'https://vk.com/track',
              },
              end_session: true,
            },
            ...static_required_data,
          });
          delete sessions[session_id];
        }
      });
      if (flag) {
        res.send({
          response: {
            text: 'Я не нашла у Вас такой посылки.',
            tts: 'Я не нашла у Вас такой посылки.',
            end_session: true,
          },
          ...static_required_data,
        });
      }
    } else if (session_payload.act === Activities.NOTIFICATION_ACCEPT) {
      console.log(request.command);
      if (request.command === 'верно') {
        const { user_id } = session.user;
        await Package.updateOne({
          userId: user_id,
          packageNumber: session_payload.trackNumber,
        }, {
          $set: {
            notification: true,
          },
        });

        res.send({
          response: {
            text: 'Теперь разрешите присылать Вам уведомления в мини-приложении.',
            tts: 'Теперь разрешите присылать Вам уведомления в мини-приложении.',
            card: {
              type: 'MiniApp',
              url: 'https://vk.com/track',
            },
            end_session: true,
          },
          ...static_required_data,
        });

        delete sessions[session_id];
      } else if (request.command === 'отмена' || request.command === 'on_interrupt') {
        res.send({
          response: {
            text: 'Если что, возвращайтесь! Помогу отследить посылку.',
            tts: 'Если что, возвращайтесь! Помогу отследить посылку.',
            end_session: true,
          },
          ...static_required_data,
        });

        delete sessions[session_id];
      }
      // eslint-disable-next-line no-useless-return
      return;
    } else if (session_payload.act === Activities.RENAME) {
      const { user_id } = session.user;
      const userPackages = await Package.find({ userId: user_id }).exec();
      let flag = true;

      userPackages.forEach((el) => {
        if (el.packageName !== null && el.packageName !== undefined && el.packageName.toUpperCase() === request.original_utterance.toUpperCase()) {
          res.send({
            response: {
              text: 'Введите новое название.',
              tts: 'Введите новое название.',
              end_session: false,
            },
            ...static_required_data,
          });

          sessions[session_id] = {
            act: Activities.RENAME_INPUT, trackNumber: el.packageNumber.toUpperCase(),
          };
          flag = false;
        }
        if (el.packageNumber.toUpperCase() === request.original_utterance.toUpperCase()) {
          res.send({
            response: {
              text: 'Введите новое название.',
              tts: 'Введите новое название.',
              end_session: false,
            },
            ...static_required_data,
          });

          sessions[session_id] = {
            act: Activities.RENAME_INPUT, trackNumber: el.packageNumber.toUpperCase(),
          };
          flag = false;
        }
      });
      if (flag) {
        res.send({
          response: {
            text: 'Я не нашла у Вас такой посылки.',
            tts: 'Я не нашла у Вас такой посылки.',
            end_session: true,
          },
          ...static_required_data,
        });
      }
    } else if (session_payload.act === Activities.RENAME_INPUT) {
      const { user_id } = session.user;
      const newName = {
        newPackageName: request.original_utterance.trim(),
      };
      await changePackageName(user_id, session_payload.trackNumber, newName);

      res.send({
        response: {
          text: 'Название посылки сохранено.',
          tts: 'Название посылки сохранено.',
          end_session: true,
        },
        ...static_required_data,
      });

      delete sessions[session_id];
    }
  }
});

module.exports = router;
