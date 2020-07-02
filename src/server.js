const app = require('./api');

const port = process.env.PORT;
require('./db');
app.listen(port || 5000, () => {
  console.log('Server working');
});

app.use(express.static("build"));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname,  "build", "index.html"));
});
