const Questions = require('../schemas/questions');

const dataForm = {
  questions: {
    id : {
      questionId: '1',
      step: '1',
      question: '1',
      backgroundCardColor: ['1','1'],
      firsAnswer: {
        id: '1',
        emoji: '1',
        text: '1',
      },
      secondAnswer: {
        id: '1',
        emoji: '1',
        text: '1',
      }
    },
  }
}

async function getQuestions() {
  let arr = await [];
  const res = await Questions.find({ }).exec()
  let ids = res.questionId
    for(let i = 0; i < res.length; i++){
      const form = {
        questions: {
          id : {
            questionId: '1',
            step: '1',
            question: '1',
            backgroundCardColor: ['1','1'],
            firsAnswer: {
              id: '1',
              emoji: '1',
              text: '1',
            },
            secondAnswer: {
              id: '1',
              emoji: '1',
              text: '1',
            }
          },
        }
      }
      form.questions.id.questionId = res[i].questionId;
      form.questions.id.step = res[i].questionId;
      form.questions.id.question = res[i].question;
      form.questions.id.backgroundCardColor = res[i].cardColor;
      form.questions.id.firsAnswer.id = res[i].questionId;
      form.questions.id.firsAnswer.emoji = res[i].emoji[0];
      form.questions.id.firsAnswer.text = res[i].variants[0];
      form.questions.id.secondAnswer.id = res[i].questionId;
      form.questions.id.secondAnswer.emoji = res[i].emoji[1];
      form.questions.id.secondAnswer.text = res[i].variants[1];
      arr.push(form);
    }
  return await res
}

console.log(getQuestions())

module.exports = {
  getQuestions,
}



// async function getQuestions() {
//   let arr = await [];
//   const res = await Questions.find({ }).exec((err, data) => {
//     for(let i = 0; i < data.length; i++){
//       let form = dataForm;
//       form.questions.id.questionId = data[i].questionId;
//       form.questions.id.step = data[i].questionId;
//       form.questions.id.question = data[i].question;
//       form.questions.id.backgroundCardColor = data[i].cardColor;
//       form.questions.id.firsAnswer.id = data[i].questionId;
//       form.questions.id.firsAnswer.emoji = data[i].emoji[0];
//       form.questions.id.firsAnswer.text = data[i].variants[0];
//       form.questions.id.secondAnswer.id = data[i].questionId;
//       form.questions.id.secondAnswer.emoji = data[i].emoji[1];
//       form.questions.id.secondAnswer.text = data[i].variants[1];
//       arr.push(form);
//     }
//   });
//   return await arr
// }