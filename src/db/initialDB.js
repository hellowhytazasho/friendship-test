const Ques = require('../schemas/questions')

function init(){
    const quest = new Ques({ questionId: '8', question: 'Фильмы или игры?', variants: ['Фильмы, Игры'], emoji: ['🍿', '🎮'], cardColor: ['#E1CAFF','#B6C8F5']});
    quest.save()
    console.log('data save')
}


module.exports = {
    init,
  }