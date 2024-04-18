import { getData, setData } from './dataStore';
import { EmptyObject, ErrorReturn, QuizListReturn, quiz, quizId, quizQuestionCreateInput, quizQuestionCreateInputV1, quizQuestionCreateReturn, quizQuestionDuplicateReturn } from './interfaces';
import { validToken, checkQuizName, checkQuestionValid, isValidQuizId, randomColour, validthumbnailUrl, checkQuestionValidV1, isActiveQuizSession } from './quizUtil';
import { saveData } from './persistence';
import HTTPError from 'http-errors';
/**
 * Provides a list of all quizzes that are owned by the currently logged in user
 * @param {string} token - unique identifier for an academic
 * @returns {{quizzes: [{quizId: number, name: string,}]}} - for valid authUserID
 */
export const adminQuizList = (token: string): QuizListReturn | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);
  saveData();
  return { quizzes: user.quizzes };
};

/**
 * Given basic details about a new quiz, create one for the logged in user.
 * @param {string} token - unique identifier for an academic
 * @param {string} name - quiz name
 * @param {string} description - quiz description
 * @returns {{quizId: number}} - for valid authUserID, name and discription
 */

export const adminQuizCreate1 = (token: string, name: string, description: string): quizId | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);
  checkQuizName(name, user.quizzes);
  if (description.length > 100) {
    throw HTTPError(400, 'Description cannot be greater than 100 characters');
  }

  data.quizIdStore += 1;
  const newQuiz = {
    quizId: data.quizIdStore,
    name: name,
    timeCreated: Math.floor(Date.now() / 1000),
    timeLastEdited: Math.floor(Date.now() / 1000),
    description: description,
    numQuestions: 0,
    questions: [],
    duration: 0,
  } as quiz;

  data.quizzes.push(newQuiz);
  user.quizzes.push({ quizId: data.quizIdStore, name: name });
  saveData();
  return {
    quizId: data.quizIdStore
  };
};

/**
 * Given basic details about a new quiz, create one for the logged in user.
 * @param {string} token - unique identifier for an academic
 * @param {string} name - quiz name
 * @param {string} description - quiz description
 * @returns {{quizId: number}} - for valid authUserID, name and discription
 */

export const adminQuizCreate2 = (token: string, name: string, description: string): quizId | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);
  checkQuizName(name, user.quizzes);
  if (description.length > 100) {
    throw HTTPError(400, 'Description cannot be greater than 100 characters');
  }

  data.quizIdStore += 1;
  const newQuiz = {
    quizId: data.quizIdStore,
    name: name,
    timeCreated: Math.floor(Date.now() / 1000),
    timeLastEdited: Math.floor(Date.now() / 1000),
    description: description,
    numQuestions: 0,
    questions: [],
    duration: 0,
    thumbnailUrl: '',
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
 * @param {string} token - unique identifier for a session
 * @param {number} quizId - unique identifier for a quiz
 * @returns {} - for valid authUserId and quizId
 */
export const adminQuizRemove = (token: string, quizId: number): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);
  const quizzesIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  const userQuizzesIndex = user.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (userQuizzesIndex === -1) {
    throw HTTPError(403, 'User does not own quiz');
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
 * @param {string} token - unique identifier for an academic
 * @param {number} quizId - unique identifier for a quiz
 * @returns {{quizId: number, name: string, timeCreated: number, timeLastEdited: number, description: string}} - for valid authUserId and quizId
 */
export const adminQuizInfo = (token: string, quizId: number): quiz | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);

  const quizzesIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (quizzesIndex === -1) {
    throw HTTPError(403, 'Invalid quizId');
  }

  const userQuizzesIndex = user.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (userQuizzesIndex === -1) {
    throw HTTPError(403, 'User does not own quiz');
  }
  saveData();
  return data.quizzes[quizzesIndex];
};

/**
 * Update the name of the relevant quiz.
 * @param {string} token - unique identifier for an academic
 * @param {number} quizId - unique identifier for a quiz
 * @param {string} name - quiz name
 * @returns {} - for valid authUserId, quizId and description
 */
export const adminQuizNameUpdate = (token: string, quizId: number, name: string): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);
  checkQuizName(name, user.quizzes);

  const quizzesIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (quizzesIndex === -1) {
    throw HTTPError(403, 'Invalid quizId');
  }

  const userQuizzesIndex = user.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (userQuizzesIndex === -1) {
    throw HTTPError(403, 'User does not own quiz');
  }

  data.quizzes[quizzesIndex].name = name;
  user.quizzes[userQuizzesIndex].name = name;
  data.quizzes[quizzesIndex].timeLastEdited = Math.floor(Date.now() / 1000);
  saveData();
  return {};
};

/**
 * Update the description of the relevant quiz.
 * @param {string} token - unique identifier for an academic
 * @param {number} quizId - unique identifier for a quiz
 * @param {string} desciption - description of quiz
 * @returns {} - Updates quiz desciption
 */
export const adminQuizDescriptionUpdate = (token: string, quizId: number, newDescription: string): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);
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
 * @param {string} token - unique identifier for logined user
 * @returns {QuizListReturn} - list of quizzes in the trash
 */
export const adminQuizViewTrash = (token: string): QuizListReturn | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);
  saveData();
  return { quizzes: user.trash };
};

export const adminQuizQuestionUpdate = (token: string, questionBody: quizQuestionCreateInput, quizId: number, questionid: number): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);

  const quizzesIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (quizzesIndex === -1) {
    throw HTTPError(403, 'Invalid quizId');
  }

  const userQuizzesIndex = user.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (userQuizzesIndex === -1) {
    throw HTTPError(403, 'User does not own quiz');
  }

  const result = checkQuestionValid(questionBody, quizId);

  const findQuiz = data.quizzes.find(quizzes => quizzes.quizId === quizId);
  const findQuestionIndex = findQuiz.questions.findIndex(questions => questions.questionId === questionid);
  if (findQuestionIndex === -1) {
    throw HTTPError(403, 'Invalid questionId');
  }
  const findQuestion = findQuiz.questions.find(questions => questions.questionId === questionid);
  findQuestion.question = questionBody.question;
  const oldDuration = findQuestion.duration;
  findQuestion.duration = questionBody.duration;
  findQuestion.points = questionBody.points;

  const answerOut = questionBody.answers.map(answer => {
    data.answerIdStore += 1;
    return {
      answerId: data.answerIdStore,
      answer: answer.answer,
      colour: randomColour(),
      correct: answer.correct,
    };
  });
  findQuestion.answers = answerOut;

  findQuiz.duration = result.duration - oldDuration;
  findQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  saveData();
  return {};
};

export const adminQuizQuestionDelete = (token: string, quizId: number, questionid: number): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);

  const quizzesIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (quizzesIndex === -1) {
    throw HTTPError(403, 'Invalid quizId');
  }

  const userQuizzesIndex = user.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (userQuizzesIndex === -1) {
    throw HTTPError(403, 'User does not own quiz');
  }

  const findQuiz = data.quizzes.find(quizzes => quizzes.quizId === quizId);
  const findQuestion = findQuiz.questions.findIndex(questions => questions.questionId === questionid);
  if (findQuestion === -1) {
    throw HTTPError(400, 'Invalid questionId');
  } else if (findQuestion > -1) {
    findQuiz.questions.splice(findQuestion, 1);
  }

  findQuiz.duration -= findQuiz.questions[findQuestion].duration;
  findQuiz.numQuestions -= 1;
  findQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  findQuiz.questions.splice(findQuestion, 1);
  saveData();
  return {};
};

/**
 * @param {string} token - unique identifier for logined user
 * @param {number} quizId - quizId
 * @returns empty object
 */
export const adminQuizRestore = (token: string, quizId: number): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);
  const quizzesIndex = data.trash.findIndex(quizzes => quizzes.quizId === quizId);
  const userQuizIndex = user.trash.findIndex(quizzes => quizzes.quizId === quizId);
  const quizUser = user.quizzes.find(quizzes => quizzes.quizId === quizId);
  if (userQuizIndex === -1) {
    if (quizUser === undefined) {
      throw HTTPError(403, 'User does not own this quiz');
    } else {
      throw HTTPError(400, 'Quiz is not currently in the trash');
    }
  }
  checkQuizName(user.trash[userQuizIndex].name, user.quizzes);
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
 * @param {string} token - unique identifier for a session
 * @param {number[]} quizIds- array of quizIds to delete
 * @returns {} - empties quizzes if they exist in the trash
 */
export const adminQuizTrashEmpty = (token: string, quizIds: number[]): EmptyObject | ErrorReturn => {
  const data = getData();

  // Check if the token is valid. error 401
  const user = validToken(token, data.users);

  // Check if the current user owns the quizzes being removed. error 403
  // If a user owns a quiz where is it stored
  for (const quizId of quizIds) {
    const quizIndexTrash = user.trash.findIndex(quiz => quiz.quizId === quizId);
    const quizIndexOwn = user.quizzes.findIndex(quiz => quiz.quizId === quizId);
    if (quizIndexTrash === -1 && quizIndexOwn === -1) {
      throw HTTPError(403, 'Valid token, but one or more of the Quiz IDs is not owned by current user');
    }
  }

  // Check if all quizzes are in the trash. error 400
  for (const quizId of quizIds) {
    const quizIndex = user.trash.findIndex(quiz => quiz.quizId === quizId);
    if (quizIndex === -1) {
      throw HTTPError(400, 'One or more of the Quiz IDs is not currently in the trash');
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
export const quizQuestionCreate1 = (token: string, questionBody: quizQuestionCreateInputV1, quizId: number): quizQuestionCreateReturn | ErrorReturn => {
  // Check token error
  const data = getData();
  validToken(token, data.users);

  // Check if the user owns this quiz
  const quiz = isValidQuizId(token, quizId);
  if ('error' in quiz) {
    return quiz as ErrorReturn;
  }
  // Check if the errors in questionBody
  const question = checkQuestionValidV1(questionBody, quizId);
  if ('error' in question) {
    return question as ErrorReturn;
  }
  // Push new question into quiz

  const findQuiz = data.quizzes.find(quizs => quizs.quizId === quizId);
  findQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  findQuiz.duration = question.duration;
  findQuiz.numQuestions += 1;
  data.questionIdStore += 1;
  const questionId = data.questionIdStore;

  const answerOut = questionBody.answers.map(answer => {
    data.answerIdStore += 1;

    return {
      answerId: data.answerIdStore,
      answer: answer.answer,
      colour: randomColour(),
      correct: answer.correct,
    };
  });

  findQuiz.questions.push({
    questionId: questionId,
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: answerOut,
  });
  setData(data);
  saveData();
  return { questionId: questionId };
};

/**
 *
 * @param {string} token - unique identifier for logined user
 * @param {Array} questionBody - the question needed to be updated to the quiz
 * @param {number} quizId - a unique identifier of quiz
 * @returns questionId
 */
export const quizQuestionCreate2 = (token: string, questionBody: quizQuestionCreateInput, quizId: number): quizQuestionCreateReturn | ErrorReturn => {
  // Check token error
  const data = getData();
  validToken(token, data.users);

  // Check if the user owns this quiz
  isValidQuizId(token, quizId);
  // Check if the thumbnailUrl is valid
  validthumbnailUrl(questionBody.thumbnailUrl);
  // Return the duration sum of the questions
  const question = checkQuestionValid(questionBody, quizId);

  // Push new question into quiz
  const findQuiz = data.quizzes.find(quizs => quizs.quizId === quizId);
  findQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  findQuiz.duration = question.duration;
  findQuiz.thumbnailUrl = questionBody.thumbnailUrl;
  findQuiz.numQuestions += 1;
  data.questionIdStore += 1;
  const questionId = data.questionIdStore;

  const answerOut = questionBody.answers.map(answer => {
    data.answerIdStore += 1;
    return {
      answerId: data.answerIdStore,
      answer: answer.answer,
      colour: randomColour(),
      correct: answer.correct,
    };
  });

  findQuiz.questions.push({
    questionId: questionId,
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: answerOut,
  });

  setData(data);
  saveData();
  return { questionId: questionId };
};

export const quizTransfer1 = (token: string, userEmail: string, quizId: number): EmptyObject | ErrorReturn => {
  const data = getData();
  validToken(token, data.users);
  isValidQuizId(token, quizId);

  const targetUser = data.users.find(users => users.email === userEmail);
  if (targetUser === undefined) {
    return { error: 'UserEmail is not a real user' };
  }
  if (targetUser.sessions.includes(token)) {
    return { error: 'UserEmail is the current logged in user' };
  }

  const findQuiz = data.quizzes.find(quizs => quizs.quizId === quizId);
  const quiz = targetUser.quizzes.find(quizzes => quizzes.name === findQuiz.name);
  if (quiz) {
    return { error: 'Quiz ID refers to a quiz that has a name that is already used by the target user' };
  }
  // push the quiz to the target user
  const currentUser = data.users.find(users => users.sessions.includes(token));
  const userQuiz = currentUser.quizzes.find(quizs => quizs.quizId === quizId);
  findQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  targetUser.quizzes.push(userQuiz);
  // delete the quiz in origin user
  const userQuizzesIndex = currentUser.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  currentUser.quizzes.splice(userQuizzesIndex, 1);
  setData(data);
  saveData();
  return {};
};

export const quizTransfer2 = (token: string, userEmail: string, quizId: number): EmptyObject | ErrorReturn => {
  const data = getData();
  validToken(token, data.users);
  isValidQuizId(token, quizId);

  const targetUser = data.users.find(users => users.email === userEmail);
  if (targetUser === undefined) {
    throw HTTPError(400, 'UserEmail is not a real user');
  }
  if (targetUser.sessions.includes(token)) {
    throw HTTPError(400, 'UserEmail is the current logged in user');
  }

  const findQuiz = data.quizzes.find(quizs => quizs.quizId === quizId);
  const quiz = targetUser.quizzes.find(quizzes => quizzes.name === findQuiz.name);
  if (quiz) {
    throw HTTPError(400, 'Quiz ID refers to a quiz that has a name that is already used by the target user');
  }

  // Check if all sessions of the quiz is in end state
  isActiveQuizSession(quizId);

  // push the quiz to the target user
  const currentUser = data.users.find(users => users.sessions.includes(token));
  const userQuiz = currentUser.quizzes.find(quizs => quizs.quizId === quizId);
  findQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  targetUser.quizzes.push(userQuiz);
  // delete the quiz in origin user
  const userQuizzesIndex = currentUser.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  currentUser.quizzes.splice(userQuizzesIndex, 1);
  setData(data);
  saveData();
  return {};
};

export const adminQuizQuestionMove = (token: string, quizId: number, questionId: number, newPosition: number): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);

  const userQuizIndex = user.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (userQuizIndex === -1) {
    return { error: 'User does not own this quiz' };
  }

  const findQuiz = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (findQuiz === -1) {
    return { error: 'Invalid quiz ID' };
  }

  const findQuestion = data.quizzes[findQuiz].questions.findIndex(quizQuestions => quizQuestions.questionId === questionId);
  if (findQuestion === -1) {
    return { error: 'Does not refer to valid question' };
  }

  if (findQuestion === newPosition || newPosition < 0 || newPosition > (data.quizzes[findQuiz].questions.length - 1)) {
    return { error: 'Position or Question Id error' };
  }

  const questionToMove = data.quizzes[findQuiz].questions.splice(findQuestion, 1)[0]; // Remove the question from its current position
  data.quizzes[findQuiz].questions.splice(newPosition, 0, questionToMove); // Insert the question into the new position

  data.quizzes[findQuiz].timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);
  saveData();
  return {};
};

export const adminQuizQuestionDuplicate = (token: string, quizId: number, questionId: number): quizQuestionDuplicateReturn | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);

  const userQuizIndex = user.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (userQuizIndex === -1) {
    return { error: 'User does not own this quiz' };
  }

  const findQuiz = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (findQuiz === -1) {
    return { error: 'Invalid quiz ID' };
  }

  const findQuestion = data.quizzes[findQuiz].questions.findIndex(quizQuestions => quizQuestions.questionId === questionId);
  if (findQuestion === -1) {
    return { error: 'Invalid questionId' };
  }

  const questionToDuplicate = data.quizzes[findQuiz].questions[findQuestion];
  const duplicateLocation = findQuestion + 1;

  // Create a copy of the question to duplicate
  const duplicatedQuestion = { ...questionToDuplicate };

  // Make a new quiz question id
  data.questionIdStore += 1;
  const newQuestionId = data.questionIdStore;
  duplicatedQuestion.questionId = newQuestionId;

  // Add the duplicated question right after the original question
  data.quizzes[findQuiz].questions.splice(duplicateLocation, 0, duplicatedQuestion);

  // Update the timeLastEdited property of the quiz
  data.quizzes[findQuiz].timeLastEdited = Math.floor(Date.now() / 1000);

  data.quizzes[findQuiz].timeLastEdited = Math.floor(Date.now() / 1000);
  data.quizzes[findQuiz].duration += duplicatedQuestion.duration;
  data.quizzes[findQuiz].numQuestions += 1;

  // Save the updated data
  setData(data);

  // Return the ID of the new question
  return { newQuestionId: duplicatedQuestion.questionId };
};
