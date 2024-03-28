import { getData, setData } from './dataStore';
import { EmptyObject, ErrorReturn, QuizListReturn, quiz, quizId, quizQuestionCreatInput, quizQuestionCreatReturn } from './interfaces';
import { validUserId, checkQuizName, checkQuestionValid, isValidQuizId } from './quizUtil';
import { isEmailUsedByOther ,isValidToken } from './authUtil';

/**
 * Provides a list of all quizzes that are owned by the currently logged in user
 * @param {number} token - unique identifier for an academic
 * @returns {{quizzes: [{quizId: number, name: string,}]}} - for valid authUserID
 */
export const adminQuizList = (token: number): QuizListReturn | ErrorReturn => {
  const data = getData();
  const user = validUserId(token, data.users);
  if ('error' in user) {
    return user;
  }

  return { quizzes: user.quizzes };
};

/**
 * Given basic details about a new quiz, create one for the logged in user.
 * @param {number} token - unique identifier for an academic
 * @param {string} name - quiz name
 * @param {string} description - quiz description
 * @returns {{quizId: number}} - for valid authUserID, name and discription
 */

export const adminQuizCreate = (token: number, name: string, description: string): quizId | ErrorReturn => {
  const data = getData();
  const user = validUserId(token, data.users);
  if ('error' in user) {
    return user;
  } else if (checkQuizName(name, user.quizzes) !== true) {
    return checkQuizName(name, user.quizzes) as ErrorReturn;
  } else if (description.length > 100) {
    return { error: 'Description cannot be greater than 100 characters' };
  }

  data.quizIdStore += 1;
  const newQuiz = {
    quizId: data.quizIdStore,
    name: name,
    timeCreated: Math.floor(Date.now() / 1000),
    timeLastEdited: Math.floor(Date.now() / 1000),
    description: description,
    quizQuestions: [],
  } as quiz;

  data.quizzes.push(newQuiz);
  user.quizzes.push({ quizId: data.quizIdStore, name: name });
  return {
    quizId: data.quizIdStore
  };
};

/**
 * Given a particular quiz, permanently remove the quiz
 * @param {number} token - unique identifier for a session
 * @param {number} quizId - unique identifier for a quiz
 * @returns {} - for valid authUserId and quizId
 */
export const adminQuizRemove = (token: number, quizId: number): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validUserId(token, data.users);
  if ('error' in user) {
    return user;
  }

  const quizzesIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (quizzesIndex === -1) {
    return { error: 'Invalid quizId' };
  }

  const userQuizzesIndex = user.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (userQuizzesIndex === -1) {
    return { error: 'User does not own quiz' };
  }

  const quiz = data.quizzes.find(quizzes => quizzes.quizId === quizId);
  const quizUser = user.quizzes.find(quizzes => quizzes.quizId === quizId);
  data.trash.push(quiz);
  user.trash.push(quizUser);
  data.quizzes.splice(quizzesIndex, 1);
  user.quizzes.splice(userQuizzesIndex, 1);

  return {};
};

/** Get all of the relevant information about the current quiz.
 * @param {number} token - unique identifier for an academic
 * @param {number} quizId - unique identifier for a quiz
 * @returns {{quizId: number, name: string, timeCreated: number, timeLastEdited: number, description: string}} - for valid authUserId and quizId
 */
export const adminQuizInfo = (token: number, quizId: number): quiz | ErrorReturn => {
  const data = getData();
  const user = validUserId(token, data.users);
  if ('error' in user) {
    return user;
  }

  const quizzesIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (quizzesIndex === -1) {
    return { error: 'Invalid quizId' };
  }

  const userQuizzesIndex = user.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (userQuizzesIndex === -1) {
    return { error: 'User does not own quiz' };
  }

  return data.quizzes[quizzesIndex];

  // return {
  //   quizId: 1,
  //   name: 'My Quiz',
  //   timeCreated: 1683125870,
  //   timeLastEdited: 1683125871,
  //   description: 'This is my quiz',
  // };
};

/**
 * Update the name of the relevant quiz.
 * @param {number} authUserId - unique identifier for an academic
 * @param {number} quizId - unique identifier for a quiz
 * @param {string} name - quiz name
 * @returns {} - for valid authUserId, quizId and description
 */
export const adminQuizNameUpdate = (token: number, quizId: number, name: string): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validUserId(token, data.users);
  if ('error' in user) {
    return user;
  } else if (checkQuizName(name, user.quizzes) !== true) {
    return checkQuizName(name, user.quizzes) as ErrorReturn;
  }

  const quizzesIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (quizzesIndex === -1) {
    return { error: 'Invalid quizId' };
  }

  const userQuizzesIndex = user.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (userQuizzesIndex === -1) {
    return { error: 'User does not own quiz' };
  }

  data.quizzes[quizzesIndex].name = name;
  user.quizzes[userQuizzesIndex].name = name;
  data.quizzes[quizzesIndex].timeLastEdited = Math.floor(Date.now() / 1000);

  return {};
};

/**
 * Update the description of the relevant quiz.
 * @param {number} authUserId - unique identifier for an academic
 * @param {number} quizId - unique identifier for a quiz
 * @param {string} desciption - description of quiz
 * @returns {} - Updates quiz desciption
 */
export const adminQuizDescriptionUpdate = (authUserId: number, quizId: number, newDescription: string): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validUserId(authUserId, data.users);
  if ('error' in user) {
    return user;
  }
  const quizIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);

  if (quizIndex === -1) {
    return { error: 'Invalid quizId' };
  }

  const userQuizIndex = user.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (userQuizIndex === -1) {
    return { error: 'User does not own this quiz' };
  }
  if (newDescription.length > 100) {
    return { error: 'New description cannot be greater than 100 characters' };
  }

  data.quizzes[quizIndex].description = newDescription;
  data.quizzes[quizIndex].timeLastEdited = Math.floor(Date.now() / 1000);

  setData(data);

  return {};
};

export const adminQuizViewTrash = (token: number): QuizListReturn | ErrorReturn => {
  const data = getData();
  const user = validUserId(token, data.users);
  if ('error' in user) {
    return user;
  }

  return { quizzes: user.trash };
};

export const adminQuizRestore = (token: number, quizId: number): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validUserId(token, data.users);
  if ('error' in user) {
    return user;
  }
  const quizzesIndex = data.trash.findIndex(quizzes => quizzes.quizId === quizId);
  const quiz = data.quizzes.find(quizzes => quizzes.quizId === quizId);
  if (quizzesIndex === -1 && quiz === undefined) {
    return { error: 'Invalid quizId' };
  }
  const userQuizIndex = user.trash.findIndex(quizzes => quizzes.quizId === quizId);
  const quizUser = user.quizzes.find(quizzes => quizzes.quizId === quizId);
  if (userQuizIndex === -1) {
    if (quizUser === undefined) {
      return { error: 'User does not own this quiz' };
    } else {
      return { error: 'Quiz is not currently in the trash' };
    }
  } else if (checkQuizName(user.trash[userQuizIndex].name, user.quizzes) !== true) {
    return checkQuizName(user.trash[userQuizIndex].name, user.quizzes) as ErrorReturn;
  }
  data.trash[quizzesIndex].timeLastEdited = Math.floor(Date.now() / 1000);
  data.quizzes.push(data.trash[quizzesIndex]);
  user.quizzes.push(user.trash[userQuizIndex]);
  data.trash.splice(quizzesIndex, 1);
  user.trash.splice(userQuizIndex, 1);

  return {};
};

/**
 *
 * @param {string} token - unique identifier for logined user
 * @param {Array} questionBody - the question needed to be updated to the quiz
 * @param {number} quizId - a unique identifier of quiz
 * @returns questionId
 */
export const quizQuestionCreat = (token: string, questionBody: quizQuestionCreatInput, quizId: number): quizQuestionCreatReturn | ErrorReturn => {
  // Check token error
  const data = getData();
  const tokenResult = validUserId(parseInt(token), data.users);
  if ('error' in tokenResult) {
    return tokenResult;
  }
  // Check if the user owns this quiz
  const quiz = isValidQuizId(token, quizId);
  if ('error' in quiz) {
    return quiz as ErrorReturn;
  }
  // Check if the errors in questionBody
  const question = checkQuestionValid(questionBody, quizId);
  if ('error' in question) {
    return question as ErrorReturn;
  }
  // Push new question into quiz

  const findQuiz = data.quizzes.find(quizs => quizs.quizId === quizId);
  findQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  const questionId = data.questionIdStore + 1;
  findQuiz.quizQuestions.push({
    questionId: questionId,
    question: questionBody.questionBody.question,
    duration: questionBody.questionBody.duration,
    points: questionBody.questionBody.points,
    answers: questionBody.questionBody.answers,
  });
  setData(data);
  return { questionId: questionId };
};

export const quizTransfer = (token: string, userEmail: string, quizId: number): EmptyObject | ErrorReturn => {
  const tokenCheck = isValidToken(token);
  if (!tokenCheck) {
    return { error: 'Token is empty or invalid' };
  }
  const quizIdCheck = isValidQuizId(token, quizId);
  if ('error' in quizIdCheck) {
    return quizIdCheck as ErrorReturn;
  }
  const emailCheck = isEmailUsedByOther(token, userEmail);
  if (!emailCheck) {
    return {error: 'UserEmail is not a real user or userEmail is the current logged in user'};
  }

  const data = getData();
  const findQuiz = data.quizzes.find(quizs => quizs.quizId === quizId);
  const user = data.users.find(users => users.sessions.includes(parseInt(token)));
  const quiz = user.quizzes.find(quizzes => quizzes.name === findQuiz.name);
  if (quiz) {
    return {error: 'Quiz ID refers to a quiz that has a name that is already used by the target user'};
  }
/*
  const findState = findQuiz.quizQuestions.find(questions => questions.state === true);
  if (findState) {
    return {error: 'Any session for this quiz is not in END state'}
  }
*/
  // push the quiz to the target user
  const targetUser = data.users.find(users => users.email === userEmail);
  targetUser.quizzes.push(findQuiz);
  // delete the quiz in origin user
  const userQuizzesIndex = user.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  user.quizzes.splice(userQuizzesIndex, 1);
  setData(data);
  return {};
};