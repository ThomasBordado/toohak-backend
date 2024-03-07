import { getData, setData } from './dataStore.js';
import { validUserId, checkQuizName } from './quizUtil.js';
import timestamp from 'unix-timestamp-offset';

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

  let data = getData();
  let user = validUserId(authUserId, data.users)
  if ('error' in user) {
    return user;
  } else if (checkQuizName(name, user.quizzes) != true) {
    return checkQuizName(name, user.quizzes);
  } else if (description.length > 100) {
    return { error: 'Description cannot be greater than 100 characters' };
  }

  data.quizIdStore += 1;
  let newQuiz = {
    quizId: data.quizIdStore,
    name: name,
    timeCreated: timestamp(),
    timeLastEdited: timestamp(),
    description: description,
  }

  data.quizzes.push(newQuiz)
  user.quizzes.push({ quizId: data.quizIdStore, name: name });
  return {
    quizId: data.quizIdStore
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
function adminQuizInfo(authUserId, quizId) {
  return {
    quizId: 1,
    name: 'My Quiz',
    timeCreated: 1683125870,
    timeLastEdited: 1683125871,
    description: 'This is my quiz',
  };
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
function adminQuizDescriptionUpdate(authUserId, quizId, newDescription) {

  let data = getData();
  let user = validUserId(authUserId, data.users);
  if ('error' in user) {
    return user;
  }
  const quizIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);

  if (quizIndex === -1) {
    return { error: 'Invalid quizId' };
  }

  const userQuizIndex = user.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (userQuizIndex == -1) {
    return { error: 'User does not own this quiz' };
  }
  if (newDescription.length > 100) {
    return { error: 'New description cannot be greater than 100 characters' };
  }

  data.quizzes[quizIndex].description = newDescription;
  data.quizzes[quizIndex].timeLastEdited = timestamp();

  setData(data);

  return {};
}

export { adminQuizCreate, adminQuizDescriptionUpdate };
