const { Router } = require('express')
const { getQuestions } = require('../../services/get-questions')
const router = Router();

router.get('/get-questions', async (req, res) => {
    let data = await getQuestions()
    getQuestions().then(console.log)
    res.send(data);
})

router.post('/set-answers', (req, res) => {
  res.send(false);
  console.log(req.body)
});

module.exports = router;
