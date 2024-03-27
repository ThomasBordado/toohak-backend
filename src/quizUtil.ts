import { quizUser, user, quizQuestionCreatInput } from './interfaces';
import { getData } from './dataStore';

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

export const checkQuestionValid = (quizQuestion: quizQuestionCreatInput, token: string) => {
  if (quizQuestion.questionBody.question.length < 5 || quizQuestion.questionBody.question.length > 50) {
    return { error: 'Question string is less than 5 characters in length or greater than 50 characters in length' };
  }

  if (quizQuestion.questionBody.answers.length > 6 || quizQuestion.questionBody.answers.length < 2) {
    return { error : 'The question has more than 6 answers or less than 2 answers'};
  }

  if (quizQuestion.questionBody.duration <= 0) {
    return { error: 'The question duration is not a positive number' };
  }

  const data = getData();
  const user = data.users.find(users => users.sessions.includes(parseInt(token)));
  let sum = 0;
  for(let i = 0, i < user.question.length) {

  }
  
  return { error: 'The sum of the question durations in the quiz exceeds 3 minutes' };

  if (quizQuestion.questionBody.points < 1 || quizQuestion.questionBody.points > 10) {
    return { error: 'The points awarded for the question are less than 1 or greater than 10'};
  }

  return { error: 'The length of any answer is shorter than 1 character long, or longer than 30 characters long' };

  return { error: 'Any answer strings are duplicates of one another (within the same question)'};

  return { error: 'There are no correct answers' };
};
