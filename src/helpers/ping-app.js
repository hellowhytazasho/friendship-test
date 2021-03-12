const axios = require('axios');

const MINUTES = 1740000;

(async function wakeup() {
  await axios.get('https://ping-for-track.herokuapp.com/');
  // eslint-disable-next-line no-console
  console.log('Woke up!');
  setTimeout(wakeup, MINUTES);
}());
