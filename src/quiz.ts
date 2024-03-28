import { getData, setData } from './dataStore';
import { EmptyObject, ErrorReturn, QuizListReturn, quiz, quizId, quizQuestionCreateInput, quizQuestionCreateReturn } from './interfaces';
import { validUserId, checkQuizName, checkQuestionValid, isValidQuizId } from './quizUtil';
import { saveData } from './persistence';

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
  saveData();
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
  saveData();
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
  saveData();
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
  saveData();
  return data.quizzes[quizzesIndex];
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
  saveData();
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
  saveData();
  return {};
};

/**
 * @param {number} token - unique identifier for logined user
 * @returns {QuizListReturn} - list of quizzes in the trash
 */
export const adminQuizViewTrash = (token: number): QuizListReturn | ErrorReturn => {
  const data = getData();
  const user = validUserId(token, data.users);
  if ('error' in user) {
    return user;
  }
  saveData();
  return { quizzes: user.trash };
};

export const adminQuizQuestionUpdate = (token: string, questionBody: quizQuestionCreateInput, quizId: number, questionid: number): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validUserId(parseInt(token), data.users);
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

  const result = checkQuestionValid(questionBody, quizId);
  if ('error' in result) {
    return result as ErrorReturn;
  }

  const findQuiz = data.quizzes.find(quizzes => quizzes.quizId === quizId);
  const findQuestionIndex = findQuiz.quizQuestions.findIndex(questions => questions.questionId === questionid);
  if (findQuestionIndex === -1) {
    return { error: 'Invalid questionId' };
  } else if (findQuestionIndex > -1) {
    const findQuestion = findQuiz.quizQuestions.find(questions => questions.questionId === questionid);
    findQuestion.question = questionBody.questionBody.question;
    findQuestion.duration = questionBody.questionBody.duration;
    findQuestion.points = questionBody.questionBody.points;
    findQuestion.answers = questionBody.questionBody.answers;
  }

  // const questionsIndex = data.quizzes.quizQuestions.findIndex(questions => quizzesIndex.quizQuestions.answers) //need to finish index

  // data.quizzes[quizzesIndex].quizQuestions[questionsIndex].question = question;
  // data.quizzes[quizzesIndex].quizQuestions[questionsIndex].duration = duration;
  // data.quizzes[quizzesIndex].quizQuestions[questionsIndex].points = points;
  // data.quizzes[quizzesIndex].quizQuestions[questionsIndex].answers.answer = answer;
  // data.quizzes[quizzesIndex].quizQuestions[questionsIndex].answers.correct = correct;
  // // user.quizzes[userQuizzesIndex].name = name;
  // data.quizzes[quizzesIndex].timeLastEdited = Math.floor(Date.now() / 1000);
  saveData();
  return {};
};

export const adminQuizQuestionDelete = (token: string, quizId: number, questionid: number): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validUserId(parseInt(token), data.users);
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

  const findQuiz = data.quizzes.find(quizzes => quizzes.quizId === quizId);
  const findQuestion = findQuiz.quizQuestions.findIndex(questions => questions.questionId === questionid);
  if (findQuestion === -1) {
    return { error: 'Invalid questionId' };
  } else if (findQuestion > -1) {
    findQuiz.quizQuestions.splice(findQuestion, 1);
  }

  // findQuiz.quizQuestions[findQuestion].question = '';
  // findQuiz.quizQuestions[findQuestion].duration = '';
  // findQuiz.quizQuestions[findQuestion].points = '';
  // findQuiz.quizQuestions[findQuestion].answers = '';

  // const questionsIndex = data.quizzes.quizQuestions.findIndex(questions => quizzesIndex.quizQuestions.answers) //need to finish index

  // data.quizzes[quizzesIndex].quizQuestions[questionsIndex].question = question;
  // data.quizzes[quizzesIndex].quizQuestions[questionsIndex].duration = duration;
  // data.quizzes[quizzesIndex].quizQuestions[questionsIndex].points = points;
  // data.quizzes[quizzesIndex].quizQuestions[questionsIndex].answers.answer = answer;
  // data.quizzes[quizzesIndex].quizQuestions[questionsIndex].answers.correct = correct;
  // // user.quizzes[userQuizzesIndex].name = name;
  // data.quizzes[quizzesIndex].timeLastEdited = Math.floor(Date.now() / 1000);
  saveData();
  return {};
};

/**
 * @param {number} token - unique identifier for logined user
 * @param {number} quizId - quizId
 * @returns empty object
 */
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
  saveData();
  return {};
};

/**
 * Empty the Trash with quizzes
 * @param {number} token - unique identifier for a session
 * @param {number[]} quizIds- array of quizIds to delete
 * @returns {} - empties quizzes if they exist in the trash
 */
export const adminQuizTrashEmpty = (token: number, quizIds: number[]): EmptyObject | ErrorReturn => {
  const data = getData();

  // Check if the token is valid. error 401
  const user = validUserId(token, data.users);
  if ('error' in user) {
    return user;
  }

  // Check if the current user owns the quizzes being removed. error 403
  // If a user owns a quiz where is it stored
  // if a quiz is in the trash from a user where?
  for (const quizId of quizIds) {
    const quizIndexTrash = user.trash.findIndex(quiz => quiz.quizId === quizId);
    const quizIndexOwn = user.quizzes.findIndex(quiz => quiz.quizId === quizId);
    if (quizIndexTrash === -1 && quizIndexOwn === -1) {
      return { error: 'Valid token, but one or more of the Quiz IDs is not owned by current user' };
    }
  }

  // Check if all quizzes are in the trash. error 400
  for (const quizId of quizIds) {
    const quizIndex = user.trash.findIndex(quiz => quiz.quizId === quizId);
    if (quizIndex === -1) {
      return { error: 'One or more of the Quiz IDs is not currently in the trash' };
    }
  }

  for (const quizId of quizIds) {
    const quizIndex = user.trash.findIndex(quiz => quiz.quizId === quizId);
    user.trash.splice(quizIndex, 1);
  }
  saveData();
  return {};
};

/**
 *
 * @param {string} token - unique identifier for logined user
 * @param {Array} questionBody - the question needed to be updated to the quiz
 * @param {number} quizId - a unique identifier of quiz
 * @returns questionId
 */
export const quizQuestionCreate = (token: string, questionBody: quizQuestionCreateInput, quizId: number): quizQuestionCreateReturn | ErrorReturn => {
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
  const questionId = findQuiz.quizQuestions.length + 1;
  findQuiz.quizQuestions.push({
    questionId: questionId,
    question: questionBody.questionBody.question,
    duration: questionBody.questionBody.duration,
    points: questionBody.questionBody.points,
    answers: questionBody.questionBody.answers,
  });
  setData(data);
  saveData();
  return { questionId: questionId };
};
