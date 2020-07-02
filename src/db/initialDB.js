const Ques = require('../schemas/questions')
const Answers = require('../schemas/answers')

function init(){
    // const quest = new Ques({ colors: ['#CAFFF5','#CAF5B6'], question: 'Фильмы или игры?', position: 9,
    //  answers: [{text: 'Фильмы', emoji: '🍿'}, {text: 'Игры', emoji: '🎮'}]});

    // quest.save()
    const userAnswer = new Answers({userId: '123', answer: [{questionId: '5efc9ccac81a700c10317257', answerId: '6efc9ccac81a700c10317257'}] })
    userAnswer.save();
    console.log('data save')
}
module.exports = {
    init,
  }