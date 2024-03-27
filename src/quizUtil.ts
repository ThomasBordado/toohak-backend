import { quizUser, user, quizQuestionCreatInput, EmptyObject, ErrorReturn } from './interfaces';
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

export const checkQuestionValid = (quizQuestion: quizQuestionCreatInput, quizId: number) => {
  // Check the string length
  if (quizQuestion.questionBody.question.length < 5 || quizQuestion.questionBody.question.length > 50) {
    return { error: 'Question string is less than 5 characters in length or greater than 50 characters in length' };
  }

  // Check the answer length
  if (quizQuestion.questionBody.answers.length > 6 || quizQuestion.questionBody.answers.length < 2) {
    return { error: 'The question has more than 6 answers or less than 2 answers' };
  }

  // Check the duration
  if (quizQuestion.questionBody.duration <= 0) {
    return { error: 'The question duration is not a positive number' };
  }

  // Calculate the sum of duration
  const data = getData();
  const quiz = data.quizzes.find(quizs => quizs.quizId === quizId);
  let sum = 0;
  for (let i = 0; i < quiz.quizQuestions.length; i++) {
    sum = sum + quiz.quizQuestions[i].duration;
  }
  sum = sum + quizQuestion.questionBody.duration;
  if (sum > 180) {
    return { error: 'The sum of the question durations in the quiz exceeds 3 minutes' };
  }

  // Check the point award
  if (quizQuestion.questionBody.points < 1 || quizQuestion.questionBody.points > 10) {
    return { error: 'The points awarded for the question are less than 1 or greater than 10' };
  }

  // Check the answer length
  for (const answer of quizQuestion.questionBody.answers) {
    if (answer.answer.length < 1 || answer.answer.length > 30) {
      return { error: 'The length of any answer is shorter than 1 character long, or longer than 30 characters long' };
    }
  }

  // Check if there's duplicate answers
  const uniqueAnswers : string[] = [];
  for (let i = 0; i < quizQuestion.questionBody.answers.length; i++) {
    const currentAnswer = quizQuestion.questionBody.answers[i].answer;
    if (!uniqueAnswers.includes(currentAnswer)) {
      uniqueAnswers.push(currentAnswer);
    } else {
      return { error: 'Any answer strings are duplicates of one another (within the same question)' };
    }
  }

  // Check if there's correct answer
  const answer = quizQuestion.questionBody.answers.find(quizs => quizs.correct === true);
  if (!answer) {
    return { error: 'There are no correct answers' };
  }

  return {};
};

/**
 * Given an authUserId and check if it's exists in the user list
 * @param {string} token - unique identifier for an login academic
 *
 * @return {boolean} -if Id is valid reutrn true, else return false
 */
export const isValidToken = (token: string): boolean => {
  const data = getData();
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
export const isValidQuizId = (token: string, quizId: number): EmptyObject | ErrorReturn => {
  // Check if the quizId is invalid
  const data = getData();
  if (data.quizzes.length === 0) {
    return { error: 'Invalid quizId' };
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
    return { error: 'user does not own the quiz' };
  } else {
    return { error: 'Invalid quizId' };
  }
};
