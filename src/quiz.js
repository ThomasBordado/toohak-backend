/**
 * Provides a list of all quizzes that are owned by the currently logged in user
 * @param {number} authUserId - unique identifier for an academic
 * @returns {{quizzes: [{quizId: number, name: string,}]}} - for valid authUserID
 */
function adminQuizList(authUserId) {
  return {
    quizzes: [
      {
        quizId: 1,
        name: 'My Quiz',
      }
    ]
  };
}

/**
 * Given basic details about a new quiz, create one for the logged in user.
 * @param {number} authUserId - unique identifier for an academic
 * @param {string} name - quiz name
 * @param {string} description - quiz description
 * @returns {{quizId: number}} - for valid authUserID, name and discription
 */
function adminQuizCreate(authUserId, name, description) {
  return {
    quizId: 2
  };
}

/**
 * Given a particular quiz, permanently remove the quiz
 * @param {number} authUserId - unique identifier for an academic
 * @param {number} quizId - unique identifier for a quiz
 * @returns {} - for valid authUserId and quizId
 */
function adminQuizRemove(authUserId, quizId) {
  return {};
}

/** Get all of the relevant information about the current quiz.
 * @param {number} authUserId - unique identifier for an academic
 * @param {number} quizId - unique identifier for a quiz
 * @returns {{quizId: number, name: string, timeCreated: number, timeLastEdited: number, description: string}} - for valid authUserId and quizId
 */
export function adminQuizInfo(authUserId, quizId) {

  let data = getData();
  let user = validUserId(authUserId, data.users)
  if ('error' in user) {
      return user;
  }

  const quizzesIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (quizzesIndex == -1) {
      return {error: 'Invalid quizId'};
  }

  const userQuizzesIndex = user.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (userQuizzesIndex == -1) {
      return {error: 'User does not own quiz'};
  }

  return data.quizzes[quizzesIndex];


  // return {
  //   quizId: 1,
  //   name: 'My Quiz',
  //   timeCreated: 1683125870,
  //   timeLastEdited: 1683125871,
  //   description: 'This is my quiz',
  // };
}

/**
 * Update the name of the relevant quiz.
 * @param {number} authUserId - unique identifier for an academic
 * @param {number} quizId - unique identifier for a quiz
 * @param {string} name - quiz name
 * @returns {} - for valid authUserId, quizId and description
 */
function adminQuizNameUpdate(authUserID, quizId, name) {
  return {};
}

/**
 * Update the description of the relevant quiz.
 * @param {number} authUserId - unique identifier for an academic
 * @param {number} quizId - unique identifier for a quiz
 * @param {string} desciption - description of quiz
 * @returns {} - Updates quiz desciption
 */
function adminQuizDescriptionUpdate(authUserId, quizId, description) {
  return {

  };
}
