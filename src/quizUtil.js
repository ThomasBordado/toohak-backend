/**
 * Check if AuthUserId is valid.
 * @param {number} AuthUserId
 * @param {
 *  Array <{userId: number,
 *    nameFirst: string,
 *    nameLast: string,
 *    email: string,
 *    password: string,
 *    numSuccessfulLogins: Number,
 *    numFailedPasswordsSinceLastLogin: number,
 *    quizzes: Array <{
 *      quizId: number,
 *      name: string
 *    }>,
 *   }>
 *  } userData
 * @returns {{
 *  userId: number,
 *  nameFirst: string,
 *  nameLast: string,
 *  email: string,
 *  password: string,
 *  numSuccessfulLogins: Number,
 *  numFailedPasswordsSinceLastLogin: number,
 *  quizzes: Array <{
 *    quizId: number,
 *    name: string
 *   }>
 *  }
 * } - for valid quiz name
  * @returns {error: string}} - for invalid quiz name
  */
function validUserId(authUserId, userData) {
  for (const user of userData) {
    if (user.userId == authUserId) {
      return user;
    }
  }

  return {error: 'Invalid AuthUserId'};
}




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

  // error if quiz name is < 3 && > 30 character
  if (name.length < 3 || name.length > 30) {
    return {error: 'Quiz name must be between 3 and 30 characters'};
  }

  // error if a character is not a letter(upper or lower) number,  or space
  for (const c of name) {
    if (!/[a-zA-Z\s\d]/.test(c)) {
      return { error: 'Name can only contain alphanumeric characters and spaces' };
    }
  }

  // error if name matches name of quiz previously owned by user
  for (const quiz of quizzesOwned) {
    if (quiz.name == name) {
      return {error: 'Quiz name previously used by user'}
    }
  }

  return true;
}

export {checkQuizName, validUserId};