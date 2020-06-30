const app = require('./api');
require('./db');
app.listen(3000, () => {
  console.log('Server working');
});
