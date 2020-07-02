const { Router } = require('express')
const { getUserAnswers } = require('../../services/get-answers')

const router = Router();


router.get('/get-answers/:userId', async (req, res) => {
  const data = await getUserAnswers(req.params.userId);
  res.send(data);
});

router.post('/set-answers', (req, res) => {
  res.send('200')
});

module.exports = router;
