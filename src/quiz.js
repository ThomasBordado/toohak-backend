/**
 * Provides a list of all quizzes that are owned by the currently logged in user
 * @param {number} authUserId - unique identifier for an academic
 * @returns {{quizzes: [{quizId: number, name: string,}]}} - for valid authUserID
 */
function adminQuizList(authUserId) {
  return {
    quizzes: [
      {
        quizId:1,
        name: 'My Quiz'
      }
    ]
  }
}

/**
 * Given basic details about a new quiz, create one for the logged in user.
 * @param {number} authUserId - unique identifier for an academic
 * @param {string} name - quiz name
 * @param {string} description - quiz description
 * @returns {{quizId: number}} - for valid authUserID, name and discription
 */
function adminQuizList(authUserId, name, description) {
  return {
    quizId: 2
  }
}

