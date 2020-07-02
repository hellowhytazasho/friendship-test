const app = require('./api');

const port = process.env.PORT;
require('./db');
app.listen(port || 5000, () => {
  console.log('Server working');
});
