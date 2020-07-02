const { Router } = require('express')
const { getQuestions, setAnswers } = require('../../services/get-questions')

const router = Router();

router.get('/get-questions', async (req, res) => {
  const data = await getQuestions();
  res.send(data);
})

router.post('/set-answers', (req, res) => {
  setAnswers(req.body);
  res.send('200');
});

module.exports = router;
