import { quizUser, user, quizQuestionCreateInput, quizQuestionCreateInputV1 } from './interfaces';
import { getData } from './dataStore';
import HTTPError from 'http-errors';

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
  */
export const validToken = (token: string, userData: user[]) => {
  // searches for sessionId and returns user if found
  if (token === '') {
    throw HTTPError(401, 'Token is empty');
  }

  for (const user of userData) {
    if (user.sessions.includes(token)) {
      return user;
    }
  }
  // throws error if not found
  throw HTTPError(401, 'Token is invalid');
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
    throw HTTPError(400, 'Quiz name must be between 3 and 30 characters');
  }

  // error if a character is not a letter(upper or lower) number,  or space
  for (const c of name) {
    if (!/[a-zA-Z\s\d]/.test(c)) {
      throw HTTPError(400, 'Name can only contain alphanumeric characters and spaces');
    }
  }

  // error if name matches name of quiz previously owned by user
  for (const quiz of quizzesOwned) {
    if (quiz.name === name) {
      throw HTTPError(400, 'Quiz name previously used by user');
    }
  }
};

export const checkQuestionValidV1 = (quizQuestion: quizQuestionCreateInputV1, quizId: number) => {
  // Check the string length
  if (quizQuestion.question.length < 5 || quizQuestion.question.length > 50) {
    return { error: 'Question string is less than 5 characters in length or greater than 50 characters in length' };
  }

  // Check the answer length
  if (quizQuestion.answers.length > 6 || quizQuestion.answers.length < 2) {
    return { error: 'The question has more than 6 answers or less than 2 answers' };
  }

  // Check the duration
  if (quizQuestion.duration <= 0) {
    return { error: 'The question duration is not a positive number' };
  }

  // Calculate the sum of duration
  const data = getData();
  const quiz = data.quizzes.find(quizs => quizs.quizId === quizId);
  let sum = 0;
  for (let i = 0; i < quiz.questions.length; i++) {
    sum = sum + quiz.questions[i].duration;
  }
  sum = sum + quizQuestion.duration;
  if (sum > 180) {
    return { error: 'The sum of the question durations in the quiz exceeds 3 minutes' };
  }

  // Check the point award
  if (quizQuestion.points < 1 || quizQuestion.points > 10) {
    return { error: 'The points awarded for the question are less than 1 or greater than 10' };
  }

  // Check the answer length
  for (const answer of quizQuestion.answers) {
    if (answer.answer.length < 1 || answer.answer.length > 30) {
      return { error: 'The length of any answer is shorter than 1 character long, or longer than 30 characters long' };
    }
  }

  // Check if there's duplicate answers
  const uniqueAnswers : string[] = [];
  for (let i = 0; i < quizQuestion.answers.length; i++) {
    const currentAnswer = quizQuestion.answers[i].answer;
    if (!uniqueAnswers.includes(currentAnswer)) {
      uniqueAnswers.push(currentAnswer);
    } else {
      return { error: 'Any answer strings are duplicates of one another (within the same question)' };
    }
  }

  // Check if there's correct answer
  const answer = quizQuestion.answers.find(quizs => quizs.correct === true);
  if (!answer) {
    return { error: 'There are no correct answers' };
  }

  return { duration: sum };
};

export const checkQuestionValid = (quizQuestion: quizQuestionCreateInput, quizId: number) => {
  // Check the string length
  if (quizQuestion.question.length < 5 || quizQuestion.question.length > 50) {
    throw HTTPError(400, 'Question string is less than 5 characters in length or greater than 50 characters in length');
  }

  // Check the answer length
  if (quizQuestion.answers.length > 6 || quizQuestion.answers.length < 2) {
    throw HTTPError(400, 'The question has more than 6 answers or less than 2 answers');
  }

  // Check the duration
  if (quizQuestion.duration <= 0) {
    throw HTTPError(400, 'The question duration is not a positive number');
  }

  // Calculate the sum of duration
  const data = getData();
  const quiz = data.quizzes.find(quizs => quizs.quizId === quizId);
  let sum = 0;

  for (let i = 0; i < quiz.questions.length; i++) {
    sum = sum + quiz.questions[i].duration;
  }
  sum = sum + quizQuestion.duration;
  if (sum > 180) {
    throw HTTPError(400, 'The sum of the question durations in the quiz exceeds 3 minutes');
  }

  // Check the point award
  if (quizQuestion.points < 1 || quizQuestion.points > 10) {
    throw HTTPError(400, 'The points awarded for the question are less than 1 or greater than 10');
  }

  // Check the answer length
  for (const answer of quizQuestion.answers) {
    if (answer.answer.length < 1 || answer.answer.length > 30) {
      throw HTTPError(400, 'The length of any answer is shorter than 1 character long, or longer than 30 characters long');
    }
  }

  // Check if there's duplicate answers
  const uniqueAnswers : string[] = [];
  for (let i = 0; i < quizQuestion.answers.length; i++) {
    const currentAnswer = quizQuestion.answers[i].answer;
    if (!uniqueAnswers.includes(currentAnswer)) {
      uniqueAnswers.push(currentAnswer);
    } else {
      throw HTTPError(400, 'Any answer strings are duplicates of one another (within the same question)');
    }
  }

  // Check if there's correct answer
  const answer = quizQuestion.answers.find(quizs => quizs.correct === true);
  if (!answer) {
    throw HTTPError(400, 'There are no correct answers');
  }

  return { duration: sum };
};

/**
 *  It can only be used after checking the token
 */
export const isValidQuizId = (token: string, quizId: number) => {
  // Check if the quizId is invalid
  const data = getData();
  if (data.quizzes.length === 0) {
    throw HTTPError(403, 'Invalid quizId');
  }

  // Check if the user own the quiz
  const quiz = data.quizzes.find(quizs => quizs.quizId === quizId);
  if (quiz) {
    const user = data.users.find(users => users.sessions.includes(token));
    const findQuiz = user.quizzes.find(quizzes => quizzes.quizId === quizId);

    // If the user owns this quiz
    if (findQuiz !== undefined) {
      return {};
    }
    throw HTTPError(403, 'user does not own the quiz');
  } else {
    throw HTTPError(403, 'Invalid quizId');
  }
};

export const validthumbnailUrl = (thumbnailUrl: string) => {
  if (thumbnailUrl === '') {
    throw HTTPError(400, 'The thumbnailUrl is an empty string.');
  }
  if (!(thumbnailUrl.toLowerCase()).endsWith('jpg') && !(thumbnailUrl.toLowerCase()).endsWith('jpeg') && !(thumbnailUrl.toLowerCase()).endsWith('png')) {
    throw HTTPError(400, 'The thumbnailUrl does not end with one of the following filetypes (case insensitive): jpg, jpeg, png');
  }
  if (!thumbnailUrl.startsWith('http://') && !thumbnailUrl.startsWith('https://')) {
    throw HTTPError(400, 'The thumbnailUrl does not begin with "http://" or "https://"');
  }
};

export const randomColour = (): string => {
  const colours = ['red', 'green', 'yellow', 'blue'];
  const index = Math.floor(Math.random() * colours.length);
  return colours[index];
};

export const isActiveQuizSession = (quizId: number) => {
  const data = getData();
  for (const session of data.quizSessions) {
    if (session.quizStatus.metadata.quizId === quizId && session.quizStatus.state !== 'END') {
      throw HTTPError(400, 'At least one session for this quiz is not in END state');
    }
  }
}

