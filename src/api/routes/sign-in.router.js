const { Router } = require('express')
const Quiz = require('../../schemas/questions')

const router = Router();


router.get('/get-questions', (req, res) => {
    
});

router.post('/set-answers', (req, res) => {
    
    res.send('200')
});

module.exports = router;
