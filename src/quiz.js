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
        name: 'My Quiz',
      }
    ]
  };
}


/**
 * Update the description of the relevant quiz.
 * @param {number} authUserId - unique identifier for an academic
 * @param {number} quizId - unique identifier for a quiz
 * @param {number} desciption - description of quiz
 * @returns {} - Updates quiz desciption
 */
function adminQuizDescriptionUpdate(authUserId, quizId, description) {
  return {

  };
}
