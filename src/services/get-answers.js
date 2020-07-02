const Answers = require('../schemas/answers');

async function getUserAnswers(userId) {
	const data = await Answers.find({userId: userId}).lean();
	return data;
};

module.exports = {
	getUserAnswers,
};
