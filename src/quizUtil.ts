import { getData } from './dataStore';
import { quizUser, user, EmptyObject, ErrorReturn } from './interfaces';

/**
 * Check if AuthUserId is valid.
 * @param {number} token - unique identifier for a session
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
 *  } userData - array of users obtained from dataStore
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
 * } - for valid sessionId
  * @returns {error: string}} - for invalid sessionId
  */
export const validUserId = (token: number, userData: user[]) => {
  // searches for sessionId and returns user if found
  for (const user of userData) {
    if (user.sessions.includes(token)) {
      return user;
    }
  }
  // returns error if not found
  return { error: 'Token is empty or invalid' };
};

/**
 * Check if quiz name is valid.
 * @param {string} name - quiz name
 * @param {
 *   Array <{
 *      quizId: number,
 *      name: string
 *      }>
 *  } quizzesOwned - array of quizzes owned by user
 * @returns {boolean} - for valid quiz name
 * @returns {error: string}} - for invalid quiz name
 */
export const checkQuizName = (name: string, quizzesOwned: quizUser[]) => {
  // error if quiz name is < 3 && > 30 character
  if (name.length < 3 || name.length > 30) {
    return { error: 'Quiz name must be between 3 and 30 characters' };
  }

  // error if a character is not a letter(upper or lower) number,  or space
  for (const c of name) {
    if (!/[a-zA-Z\s\d]/.test(c)) {
      return { error: 'Name can only contain alphanumeric characters and spaces' };
    }
  }

  // error if name matches name of quiz previously owned by user
  for (const quiz of quizzesOwned) {
    if (quiz.name === name) {
      return { error: 'Quiz name previously used by user' };
    }
  }

  return true;
};

/**
 * Given an authUserId and check if it's exists in the user list
 * @param {string} token - unique identifier for an login academic
 *
 * @return {boolean} -if Id is valid reutrn true, else return false
 */
export const isValidToken = (token: string): boolean => {
  const data = getData();
  if (token === '') {
    return false;
  }
  if (data.users.length === 0) {
    return false;
  }
  if (token === '') {
    return false;
  }
  for (const users of data.users) {
    if (users.sessions.includes(parseInt(token))) {
      return true;
    }
  }
  return false;
};

/**
 * 
 */
export const isValidQuizId = (token: string, quizId: number): EmptyObject | ErrorReturn=> {
  // Check if the quizId is invalid
  const data = getData();
  if (data.quizzes.length === 0) {
    return { error: 'Invalid quizId'};
  }

  // Check if the user own the quiz
  const quiz = data.quizzes.find(quizs => quizs.quizId === quizId);
  if (quiz) {
    const user = data.users.find(users => users.sessions.includes(parseInt(token)));
    const findQuiz = user.quizzes.find(quizzes => quizzes.quizId === quizId);
    // If the user owns this quiz
    if (findQuiz) {
      return {};
    }
    return {error: 'user does not own the quiz'};
  } else {
    return {error: 'Invalid quizId'};
  }
}
