/**
 * Check if quiz name is valid.
 * @param {string} name - quiz name
 * @param {
 *   Array <{
 *      quizId: number,
 *      name: string
 *      }>
 *  } quizzesOwned
 * @returns {boolean} - for valid quiz name
 * @returns {error: string}} - for invalid quiz name
 */

function checkQuizName(name, quizzesOwned) {

    if (name.length < 3 || name.length > 30) {
        return {error: 'Quiz name must be between 3 and 30 characters'};
    }

    for (const c of name) {
        if (!/[a-zA-Z\s\d]/.test(c)) {
            return { error: 'Name can only contain alphanumeric characters and spaces' };
        }
    }

    for (const quiz of quizzesOwned) {
        if (quiz.name == name) {
            return {error: 'Quiz name previously used by user'}
        }
    }

    return true;

}

export {checkQuizName};