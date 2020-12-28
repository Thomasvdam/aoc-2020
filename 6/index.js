const { getInput } = require('../setup');

function getAllMembersYesCountPerQuestion(group) {
    return Object.keys(group.answers).reduce((acc, key) => {
        if (group.answers[key] === group.memberCount) return ++acc;
        return acc;
    }, 0);
}

function getYesCountsPerQuestion(groupAnswers) {
    return Object.keys(groupAnswers).length;
}

function processGroup(rawGroup) {
    const members = rawGroup.split('\n').filter(Boolean)
        .map(rawPerson => rawPerson.split(''));

    const groupAnswers = members.reduce((acc, answers) => {
        answers.forEach(answer => {
            if (acc[answer]) {
                acc[answer]++;
            } else {
                acc[answer] = 1;
            }
        });
        return acc;
    }, {});

    return {
        answers: groupAnswers,
        memberCount: members.length,
    };
}

getInput(data => {
    const groups = data.split(/^\n/m).map(processGroup);
    const totalQuestionsAnsweredYes = groups.map(group => getYesCountsPerQuestion(group.answers)).reduce((acc, num) => acc + num);
    console.log('[DEBUG]: totalQuestionsAnsweredYes ::: ', totalQuestionsAnsweredYes);
    const totalQuestionsAllAnsweredYes = groups.map(getAllMembersYesCountPerQuestion).reduce((acc, num) => acc + num);
    console.log('[DEBUG]: totalQuestionsAllAnsweredYes ::: ', totalQuestionsAllAnsweredYes);
});
