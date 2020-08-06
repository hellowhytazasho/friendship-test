const { Router } = require('express')
const { getUserHistory, setUser } = require('../../services/get-user-info')

const router = Router();

router.get('/get-user-info/:userId', async (req, res) => {
  const data = await getUserHistory(req.params.userId);
  res.send(data);
})

router.post('/set-user-info',async (req, res) => {
  const data = await setUser(req.body);
  res.send(data);
});

module.exports = router;
