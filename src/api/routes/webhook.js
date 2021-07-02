/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
const { Router } = require('express');
const { addPackage, changePackageName } = require('../../services/packages.service');
const { Package } = require('../../model/package');
const logger = require('../../logger')('webhook');

const router = Router();

const TWO_WORDS = 2;
const THREE_WORDS = 3;
const FOUR_WORDS = 4;
const PACKAGE_LENGTH = 3;
const BAD_PACKAGE_NUMBER_LENGTH = 4;
const TWO_ELEMENTS = 2;

const HELLO_MESSAGE = {
  text: 'Выберите что нужно сделать: отследить посылку, переименовать посылку, включить уведомление о посылке, посмотреть какие посылки в пути.',
  tts: 'Выберите что нужно сделать: отследить посылку, переименовать посылку, включить уведомление о посылке, посмотреть какие посылки в пути.',
  end_session: false,
  buttons: [
    {
      title: 'Отследить посылку',
      payload: { act: 'track' },
    },
    {
      title: 'Переименовать посылку',
      payload: { act: 'rename' },
    },
    {
      title: 'Включить уведомления',
      payload: { act: 'notify' },
    },
  ],
};
const BYE_MESSAGE = {
  text: 'Хотите выйти из навыка?',
  tts: 'Хотите выйти из навыка?',
  end_session: false,
  buttons: [
    {
      title: 'Да',
      payload: { act: 'exit' },
    },
    {
      title: 'Нет',
      payload: { act: 'hello_msg' },
    },
  ],
};

const END_MESSAGE = {
  text: 'Всего доброго! Возвращайтесь ещё.',
  tts: 'Всего доброго! Возвращайтесь ещё.',
  end_session: true,
};

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
  isHelp: () => contains(tokens, ['помощь', 'хэлп', 'help', 'старт', 'start', 'команды', 'test', 'тест']) === 1,
  isFirstWrite: () => contains(tokens, ['где', 'моя', 'посыл']) === THREE_WORDS
  || contains(tokens, ['запусти', 'скилл', 'посылки']) === THREE_WORDS
  || contains(tokens, ['запусти', 'скилл', 'трекер', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['запусти', 'скилл', 'отслеживание', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['запусти', 'скилл', 'tracker', 'посылок']) === FOUR_WORDS
  // ---------------------------------------------------------------------------------
  || contains(tokens, ['открой', 'скилл', 'посылки']) === THREE_WORDS
  || contains(tokens, ['открой', 'скилл', 'трекер', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['открой', 'скилл', 'отслеживание', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['открой', 'скилл', 'tracker', 'посылок']) === FOUR_WORDS
  // ---------------------------------------------------------------------------------
  || contains(tokens, ['включи', 'скилл', 'посылки']) === THREE_WORDS
  || contains(tokens, ['включи', 'скилл', 'трекер', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['включи', 'скилл', 'отслеживание', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['включи', 'скилл', 'tracker', 'посылок']) === FOUR_WORDS
  // ---------------------------------------------------------------------------------
  || contains(tokens, ['хочу', 'скилл', 'посылки']) === THREE_WORDS
  || contains(tokens, ['хочу', 'скилл', 'трекер', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['хочу', 'скилл', 'отслеживание', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['хочу', 'скилл', 'tracker', 'посылок']) === FOUR_WORDS
  // ---------------------------------------------------------------------------------
  || contains(tokens, ['запусти', 'skill', 'посылки']) === THREE_WORDS
  || contains(tokens, ['запусти', 'skill', 'трекер', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['запусти', 'skill', 'отслеживание', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['запусти', 'skill', 'tracker', 'посылок']) === FOUR_WORDS

  || contains(tokens, ['открой', 'skill', 'посылки']) === THREE_WORDS
  || contains(tokens, ['открой', 'skill', 'трекер', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['открой', 'skill', 'отслеживание', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['открой', 'skill', 'tracker', 'посылок']) === FOUR_WORDS

  || contains(tokens, ['включи', 'skill', 'посылки']) === THREE_WORDS
  || contains(tokens, ['включи', 'skill', 'трекер', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['включи', 'skill', 'отслеживание', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['включи', 'skill', 'tracker', 'посылок']) === FOUR_WORDS

  || contains(tokens, ['хочу', 'skill', 'посылки']) === THREE_WORDS
  || contains(tokens, ['хочу', 'skill', 'трекер', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['хочу', 'skill', 'отслеживание', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['хочу', 'skill', 'tracker', 'посылок']) === FOUR_WORDS
  // ---------------------------------------------------------------------------------
  || contains(tokens, ['запусти', 'навык', 'посылки']) === THREE_WORDS
  || contains(tokens, ['запусти', 'навык', 'трекер', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['запусти', 'навык', 'отслеживание', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['запусти', 'навык', 'tracker', 'посылок']) === FOUR_WORDS
  // ---------------------------------------------------------------------------------
  || contains(tokens, ['открой', 'навык', 'посылки']) === THREE_WORDS
  || contains(tokens, ['открой', 'навык', 'трекер', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['открой', 'навык', 'отслеживание', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['открой', 'навык', 'tracker', 'посылок']) === FOUR_WORDS
  // ---------------------------------------------------------------------------------
  || contains(tokens, ['включи', 'навык', 'посылки']) === THREE_WORDS
  || contains(tokens, ['включи', 'навык', 'трекер', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['включи', 'навык', 'отслеживание', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['включи', 'навык', 'tracker', 'посылок']) === FOUR_WORDS
  // ---------------------------------------------------------------------------------
  || contains(tokens, ['хочу', 'навык', 'посылки']) === THREE_WORDS
  || contains(tokens, ['хочу', 'навык', 'трекер', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['хочу', 'навык', 'отслеживание', 'посылок']) === FOUR_WORDS
  || contains(tokens, ['хочу', 'навык', 'tracker', 'посылок']) === FOUR_WORDS,
  TRACK: 0,
  isTrack: () => contains(tokens, ['отследи', 'посыл']) === TWO_WORDS
      || contains(tokens, ['определ', 'посыл']) === TWO_WORDS
      || contains(tokens, ['отслед', 'друг', 'посыл']) === TWO_WORDS,
  TRANSIT: 1,
  DETAIL: 6,
  isTransit: () => contains(tokens, ['какие', 'посыл', 'не', 'достав']) === FOUR_WORDS
      || contains(tokens, ['какие', 'посыл', 'недостав']) === THREE_WORDS
      || contains(tokens, ['какие', 'посыл', 'едут']) === THREE_WORDS
      || contains(tokens, ['какие', 'посыл', 'в', 'пути']) === FOUR_WORDS
      || contains(tokens, ['сколько', 'посыл', 'в', 'пути']) === FOUR_WORDS,
  NOTIFICATION: 2,
  isNotification: () => contains(tokens, ['включ', 'уведом', 'о', 'посыл']) === FOUR_WORDS
      || contains(tokens, ['уведом', 'о', 'посыл']) === THREE_WORDS
      || contains(tokens, ['включ', 'уведом']) === TWO_WORDS,
  NOTIFICATION_INPUT_TRACK: 3,
  NOTIFICATION_ACCEPT: 4,
  RENAME: 5,
  isRename: () => contains(tokens, ['измен', 'назван', 'посыл']) === THREE_WORDS
      || contains(tokens, ['редактир', 'назван', 'посыл']) === THREE_WORDS
      || contains(tokens, ['переимен', 'назван', 'посыл']) === THREE_WORDS
      || contains(tokens, ['переимен', 'посыл']) === TWO_WORDS,
  RENAME_INPUT: 7,
  isStop: () => contains(tokens, ['отмена', 'стоп', 'пока']) === 1,
  BYE: 8,
  YES_OR_NOT: 9,
};

router.post('/webhook', async (req, res) => {
  const { body } = req;
  const {
    request,
    session,
    version,
  } = body;
  logger.info(body);

  const { session_id } = session;
  const static_required_data = {
    session,
    version,
  };
  const session_payload = sessions[session_id];
  tokens = request.nlu.tokens;

  if (Activities.isFirstWrite()) {
    res.send({
      response: {
        ...HELLO_MESSAGE,
      },
      ...static_required_data,
    });
    sessions[session_id] = {
      skillStarted: true,
    };
    return;
  }

  console.log(session_payload, request.command);
  if (session_payload.skillStarted) {
    if (session.user === undefined) {
      res.send({
        response: {
          text: 'Я могу помочь с отслеживанием посылки — переходите в мини-приложение!',
          tts: 'Я могу помочь с отслеживанием посылки — переходите в мини-приложение!',
          card: {
            type: 'MiniApp',
            url: 'https://vk.com/track',
          },
          end_session: false,
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
        act: Activities.TRACK, skillStarted: true,
      };
      return;
    } else if (Activities.isTransit()) {
      const { user_vk_id } = session.user;
      const userPackages = await Package.find({ userId: user_vk_id, deliveredStatus: 0 });
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
            tts: `${message} Хотите отследить посылку?`,
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

        sessions[session_id] = {
          act: Activities.YES_OR_NOT, skillStarted: true,
        };
      } else {
        res.send({
          response: {
            text: 'У Вас нет активных посылок.',
            tts: 'У Вас нет активных посылок. Хотите отследить посылку?',
            buttons: [{
              title: 'Отследить другую посылку',
              payload: {
                type: 0,
              },
            },
            ],
            end_session: false,
          },
          ...static_required_data,
        });
      }
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
        act: Activities.NOTIFICATION, skillStarted: true,
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
        act: Activities.RENAME, skillStarted: true,
      };
      return;
    } else if (Activities.isHelp()) {
      res.send({
        response: {
          ...HELLO_MESSAGE,
        },
        ...static_required_data,
      });
      sessions[session_id] = {
        skillStarted: true,
      };
      return;
    } else if (Activities.isStop() || request.command === 'on_interrupt') {
      res.send({
        response: {
          ...END_MESSAGE,
        },
        ...static_required_data,
      });
      delete sessions[session_id];
      return;
    } else if (!session_payload.act && session_payload.act !== 0) {
      console.log(session_payload.act);
      res.send({
        response: {
          ...HELLO_MESSAGE,
        },
        ...static_required_data,
      });
      sessions[session_id] = {
        skillStarted: true,
      };
      return;
    }
  }

  if (session_payload) {
    if (session_payload.act === Activities.TRACK) {
      if (request.command.length < BAD_PACKAGE_NUMBER_LENGTH && request.command !== 'подробнее') {
        res.send({
          response: {
            text: 'Упс, кажется в трек-номере есть ошибочка.',
            tts: 'Упс, кажется в трек-номере есть ошибочка. Хотите отследить другую посылку?',
            buttons: [{
              title: 'Отследить другую посылку',
              payload: {
                type: 0,
              },
            },
            ],
            end_session: false,
          },
          ...static_required_data,
        });

        sessions[session_id] = {
          act: Activities.YES_OR_NOT, skillStarted: true,
        };
      } else {
        const { user_vk_id } = session.user;
        let packageData = await Package.findOne({ userId: user_vk_id, packageNumber: request.command.toUpperCase() }).exec();
        const packageDataWithName = await Package.find({ userId: user_vk_id });
        let flag = true;

        if (packageData === null) {
          try {
            packageData = await addPackage(user_vk_id, { packageNumber: request.command.toUpperCase() });
            await Package.remove({ userId: user_vk_id, events: { $exists: true, $size: 0 } });
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

              if (el.events.length === 1) {
                res.send({
                  response: {
                    text: 'Я буду внимательно следить за перемещением посылки, а пока что стоит подождать, пока появятся первые данные о перемещении.',
                    tts: 'Я буду внимательно следить за перемещением посылки, а пока что стоит подождать, пока появятся первые данные о перемещении. Хотите отследить другую посылку?',
                    buttons: [{
                      title: 'Отследить другую посылку',
                      payload: {
                        type: 0,
                      },
                    },
                    ],
                    end_session: false,
                  },
                  ...static_required_data,
                });
                sessions[session_id] = {
                  act: Activities.YES_OR_NOT, skillStarted: true,
                };
                return;
              }

              res.send({
                response: {
                  text: `Последний статус: ${lastOperation}. Хотите узнать подробнее?`,
                  tts: `Последний статус: ${lastOperation}. Хотите узнать подробнее?`,
                  end_session: false,
                  buttons: [{
                    title: 'Да',
                    payload: {
                      type: 0,
                    },
                  },
                  {
                    title: 'Нет',
                    payload: {
                      type: 1,
                    },
                  },
                  ],
                },
                ...static_required_data,
              });
              sessions[session_id] = {
                act: Activities.DETAIL, trackNumber: el.packageNumber.toUpperCase(), skillStarted: true,
              };
            }
          });
          if (flag) {
            res.send({
              response: {
                text: 'Я не нашла у Вас посылку с таким именем.',
                tts: 'Я не нашла у Вас посылку с таким именем. Хотите отследить другую посылку?',
                buttons: [{
                  title: 'Отследить другую посылку',
                  payload: {
                    type: 0,
                  },
                },
                ],
                end_session: false,
              },
              ...static_required_data,
            });
            sessions[session_id] = {
              act: Activities.YES_OR_NOT, skillStarted: true,
            };
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
              tts: 'Трек-код не действителен. Хотите отследить другую посылку?',
              buttons: [{
                title: 'Отследить другую посылку',
                payload: {
                  type: 0,
                },
              },
              ],
              end_session: false,
            },
            ...static_required_data,
          });
          sessions[session_id] = {
            act: Activities.YES_OR_NOT, skillStarted: true,
          };
          return;
        }

        if (packageData.events.length === 1) {
          res.send({
            response: {
              text: 'Я буду внимательно следить за перемещением посылки, а пока что стоит подождать, пока появятся первые данные о перемещении.',
              tts: 'Я буду внимательно следить за перемещением посылки, а пока что стоит подождать, пока появятся первые данные о перемещении. Хотите отследить другую посылку?',
              buttons: [{
                title: 'Отследить другую посылку',
                payload: {
                  type: 0,
                },
              },
              ],
              end_session: false,
            },
            ...static_required_data,
          });
          sessions[session_id] = {
            act: Activities.YES_OR_NOT, skillStarted: true,
          };
          return;
        }

        const packageEventsLength = packageData.events.length;
        const lastOperation = packageData.events[packageEventsLength - 1].operationAttributeOriginal === undefined ? packageData.events[packageEventsLength - TWO_WORDS].operationAttributeOriginal : packageData.events[packageEventsLength - 1].operationAttributeOriginal;

        res.send({
          response: {
            text: `Последний статус: ${lastOperation}. Хотите узнать подробнее?`,
            tts: `Последний статус: ${lastOperation}. Хотите узнать подробнее?`,
            end_session: false,
            buttons: [{
              title: 'Да',
              payload: {
                type: 0,
              },
            },
            {
              title: 'Нет',
              payload: {
                type: 1,
              },
            },
            ],
          },
          ...static_required_data,
        });
        sessions[session_id] = {
          act: Activities.DETAIL, trackNumber: request.command.toUpperCase(), skillStarted: true,
        };
      }
    } else if (session_payload.act === Activities.DETAIL) {
      if (request.command === 'да') {
        const packageData = await await Package.findOne({ packageNumber: session_payload.trackNumber }).exec();
        const packageEventsLength = packageData.events.length;
        const { serviceName } = packageData.events[packageEventsLength - 1];
        const deliveredDateTime = packageData.trackDeliveredDateTime === '' ? 'неизвестно' : packageData.trackDeliveredDateTime;

        let lastPlace;
        let lastWeight;
        let lastService;

        if (serviceName === 'Track24' || serviceName === 'Track24.ru') {
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
            tts: `Подробности посылки: \nМаршрут: ${lastPlace} \nВес: ${lastWeight} \nОтправитель: ${lastService} \nПриблизительная дата прибытия: ${deliveredDateTime}. Хотите отследить другую посылку?`,
            buttons: [{
              title: 'Отследить другую посылку',
              payload: {
                type: 0,
              },
            },
            ],
            end_session: false,
          },
          ...static_required_data,
        });

        sessions[session_id] = {
          act: Activities.YES_OR_NOT, skillStarted: true,
        };
      } else {
        res.send({
          response: {
            ...BYE_MESSAGE,
          },
          ...static_required_data,
        });

        sessions[session_id].act = Activities.BYE;
      }
    } else if (session_payload.act === Activities.NOTIFICATION) {
      const { user_vk_id } = session.user;

      if (request.command === 'обо всех') {
        const userPackages = await Package.find({ userId: user_vk_id, deliveredStatus: 0 }).exec();
        if (userPackages) {
          await Package.updateMany({
            userId: user_vk_id,
          }, {
            $set: {
              notification: false,
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
              end_session: false,
            },
            ...static_required_data,
          });

          delete sessions[session_id].act;
        } else {
          res.send({
            response: {
              ...BYE_MESSAGE,
              text: 'У Вас нет посылок. Хотите выйти из навыка?',
              tts: 'У Вас нет посылок. Хотите выйти из навыка?',
              end_session: false,
            },
            ...static_required_data,
          });

          sessions[session_id].act = Activities.BYE;
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

        sessions[session_id] = { act: Activities.NOTIFICATION_INPUT_TRACK, skillStarted: true };
      }
    } else if (session_payload.act === Activities.NOTIFICATION_INPUT_TRACK) {
      const { user_vk_id } = session.user;

      const userPackages = await Package.find({ userId: user_vk_id }).exec();
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
            act: Activities.NOTIFICATION_ACCEPT, trackNumber: el.packageNumber, skillStarted: true,
          };
        }
        if (el.packageNumber.toUpperCase() === request.original_utterance.toUpperCase()) {
          flag = false;

          await Package.updateOne({
            userId: user_vk_id,
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
              end_session: false,
            },
            ...static_required_data,
          });
          delete sessions[session_id].act;
        }
      });
      if (flag) {
        res.send({
          response: {
            ...BYE_MESSAGE,
            text: 'Я не нашла у Вас такой посылки. Хотите выйти из навыка?',
            tts: 'Я не нашла у Вас такой посылки. Хотите выйти из навыка?',
            end_session: false,
          },
          ...static_required_data,
        });

        sessions[session_id].act = Activities.BYE;
      }
    } else if (session_payload.act === Activities.NOTIFICATION_ACCEPT) {
      console.log(request.command);
      if (request.command === 'верно') {
        const { user_vk_id } = session.user;
        await Package.updateOne({
          userId: user_vk_id,
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
            end_session: false,
          },
          ...static_required_data,
        });

        delete sessions[session_id].act;
      } else if (request.command === 'отмена' || request.command === 'on_interrupt') {
        res.send({
          response: {
            ...END_MESSAGE,
          },
          ...static_required_data,
        });

        delete sessions[session_id].act;
      }
      // eslint-disable-next-line no-useless-return
      return;
    } else if (session_payload.act === Activities.RENAME) {
      const { user_vk_id } = session.user;
      const userPackages = await Package.find({ userId: user_vk_id }).exec();
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
            act: Activities.RENAME_INPUT, trackNumber: el.packageNumber.toUpperCase(), skillStarted: true,
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
            act: Activities.RENAME_INPUT, trackNumber: el.packageNumber.toUpperCase(), skillStarted: true,
          };
          flag = false;
        }
      });
      if (flag) {
        res.send({
          response: {
            ...BYE_MESSAGE,
            text: 'Я не нашла у Вас такой посылки. Хотите выйти из навыка?',
            tts: 'Я не нашла у Вас такой посылки. Хотите выйти из навыка?',
            end_session: false,
          },
          ...static_required_data,
        });

        sessions[session_id].act = Activities.BYE;
      }
    } else if (session_payload.act === Activities.RENAME_INPUT) {
      const { user_vk_id } = session.user;
      const newName = {
        newPackageName: request.original_utterance.trim(),
      };
      await changePackageName(user_vk_id, session_payload.trackNumber, newName);
      res.send({
        response: {
          ...BYE_MESSAGE,
          text: 'Название посылки сохранено. Хотите выйти из навыка?',
          tts: 'Название посылки сохранено. Хотите выйти из навыка?',
          end_session: false,
        },
        ...static_required_data,
      });

      sessions[session_id].act = Activities.BYE;
    } else if (session_payload.act === Activities.BYE) {
      if (request.command === 'да') {
        res.send({
          response: {
            ...END_MESSAGE,
          },
          ...static_required_data,
        });

        delete sessions[session_id];
      } else {
        res.send({
          response: {
            ...HELLO_MESSAGE,
          },
          ...static_required_data,
        });
        sessions[session_id] = {
          skillStarted: true,
        };
      }
    } else if (session_payload.act === Activities.YES_OR_NOT) {
      if (request.command === 'да') {
        res.send({
          response: {
            text: 'Чтобы отследить посылку, введите трек-номер или название посылки.',
            tts: 'Чтобы отследить посылку, введите трек-номер или название посылки.',
            end_session: false,
          },
          ...static_required_data,
        });
        sessions[session_id] = {
          act: Activities.TRACK, skillStarted: true,
        };
      } else if (request.command === 'нет') {
        res.send({
          response: {
            ...BYE_MESSAGE,
          },
          ...static_required_data,
        });

        sessions[session_id].act = Activities.BYE;
      } else {
        res.send({
          response: {
            ...HELLO_MESSAGE,
          },
          ...static_required_data,
        });

        delete sessions[session_id].act;
      }
    }
  }
});

module.exports = router;
