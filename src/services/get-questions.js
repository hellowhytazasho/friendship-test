const Questions = require('../schemas/questions');
const Answers = require('../schemas/answers');

async function getQuestions() {
  const data = await Questions.find({}).lean();
  return data;
}

async function setAnswers(data) {
  const arr =  data.answer.map((elem) => elem);
  const userAnswer = new Answers({userId: data.userId, answer: arr})
  userAnswer.save();
  console.log('save')
}

module.exports = {
  getQuestions,  
  setAnswers,
}
