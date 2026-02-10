import { getData, setData } from './dataStore';
import { EmptyObject, ErrorReturn, QuizListReturn, quiz, quizId, quizQuestionCreateInput, quizQuestionCreateInputV1, quizQuestionCreateReturn, quizQuestionDuplicateReturn, QuizSession, State, Action, MessageInput, MessageListReturn } from './interfaces';
import { validToken, checkQuizName, checkQuestionValid, isValidQuizId, randomColour, validthumbnailUrl, checkQuestionValidV1, isActiveQuizSession, ValidPlayerId, playerIdToPlayer, arrayToCSVAddress, validSession } from './quizUtil';
import { playerSessionResults } from './player';
import { saveData } from './persistence';
import HTTPError from 'http-errors';

/**
 * Provides a list of all quizzes that are owned by the currently logged in user
 * @param {string} token - unique identifier for a session
 * @returns {{quizzes: [{quizId: number, name: string,}]}} - for valid token
 */
export const adminQuizList = (token: string): QuizListReturn | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);
  saveData();
  return { quizzes: user.quizzes };
};

/**
 * Given basic details about a new quiz, create one for the logged in user.
 * @param {string} token - unique identifier for a session
 * @param {string} name - quiz name
 * @param {string} description - quiz description
 * @returns {{quizId: number}} - for valid token, name and discription
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
 * @param {string} token - unique identifier for a session
 * @param {string} name - quiz name
 * @param {string} description - quiz description
 * @returns {{quizId: number}} - for valid token, name and discription
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
 * @returns {} - for valid token and quizId
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
  if (!quiz || !quizUser) {
    throw HTTPError(500, 'Quiz data inconsistency');
  }
  data.trash.push(quiz);
  user.trash.push(quizUser);
  data.quizzes.splice(quizzesIndex, 1);
  user.quizzes.splice(userQuizzesIndex, 1);
  saveData();
  return {};
};

/** Get all of the relevant information about the current quiz.
 * @param {string} token - unique identifier for a session
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
 * @param {string} token - unique identifier for a session
 * @param {number} quizId - unique identifier for a quiz
 * @param {string} name - quiz name
 * @returns {} - for valid token, quizId and description
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
 * @param {string} token - unique identifier for an session
 * @param {number} quizId - unique identifier for a quiz
 * @param {string} desciption - description of quiz
 * @returns {} - Updates quiz desciption
 */
export const adminQuizDescriptionUpdate = (token: string, quizId: number, newDescription: string): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);

  const quizIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);

  if (quizIndex === -1) {
    throw HTTPError(403, 'Invalid quizId');
  }

  const userQuizIndex = user.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (userQuizIndex === -1) {
    throw HTTPError(403, 'User does not own this quiz');
  }
  if (newDescription.length > 100) {
    throw HTTPError(400, 'Description cannot be greater than 100 characters');
  }

  data.quizzes[quizIndex].description = newDescription;
  data.quizzes[quizIndex].timeLastEdited = Math.floor(Date.now() / 1000);

  setData(data);
  saveData();
  return {};
};

/** View the quizzes in the trash
 * @param {string} token - unique identifier for logined user
 * @returns {QuizListReturn} - list of quizzes in the trash
 */
export const adminQuizViewTrash = (token: string): QuizListReturn | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);
  saveData();
  return { quizzes: user.trash };
};

/**
 * Update existing question (without thumbnail)
 * @param {string} token - unique identifier for logged in user
 * @param {quizQuestionCreateInputV1} questionBody - the question needed to be updated to the quiz
 * @param {number} quizId - unique identifier for a quiz
 * @param {number} questionid - unique identifier for a question
 * @returns {} - For successful question update
 */
export const adminQuizQuestionUpdateV1 = (
  token: string,
  questionBody: quizQuestionCreateInputV1,
  quizId: number,
  questionid: number
): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);

  const quizzesIndex = data.quizzes.findIndex(q => q.quizId === quizId);
  if (quizzesIndex === -1) {
    throw HTTPError(403, 'Invalid quizId');
  }

  const userQuizzesIndex = user.quizzes.findIndex(q => q.quizId === quizId);
  if (userQuizzesIndex === -1) {
    throw HTTPError(403, 'User does not own quiz');
  }

  const result = checkQuestionValidV1(questionBody, quizId);

  const findQuiz = data.quizzes.find(q => q.quizId === quizId);
  if (!findQuiz) {
    throw HTTPError(500, 'Quiz data inconsistency');
  }

  const findQuestionIndex = findQuiz.questions.findIndex(
    q => q.questionId === questionid
  );
  if (findQuestionIndex === -1) {
    throw HTTPError(400, 'Invalid questionId');
  }

  const findQuestion = findQuiz.questions.find(
    q => q.questionId === questionid
  );
  if (!findQuestion) {
    throw HTTPError(500, 'Question data inconsistency');
  }

  // Update question fields
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



/**
 * Update existing question (with thumbnail)
 * @param {string} token - unique identifier for logged in user
 * @param {quizQuestionCreateInput} questionBody - the question needed to be updated to the quiz
 * @param {number} quizId - unique identifier for a quiz
 * @param {number} questionid - unique identifier for a question
 * @returns {} - For successful question update
 */
export const adminQuizQuestionUpdate = (
  token: string,
  questionBody: quizQuestionCreateInput,
  quizId: number,
  questionid: number
): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);

  const quizzesIndex = data.quizzes.findIndex(q => q.quizId === quizId);
  if (quizzesIndex === -1) {
    throw HTTPError(403, 'Invalid quizId');
  }

  const userQuizzesIndex = user.quizzes.findIndex(q => q.quizId === quizId);
  if (userQuizzesIndex === -1) {
    throw HTTPError(403, 'User does not own quiz');
  }

  // Validate thumbnail (throws on invalid)
  validthumbnailUrl(questionBody.thumbnailUrl);

  // Validate question body (throws on invalid, returns duration)
  const result = checkQuestionValid(questionBody, quizId);

  const findQuiz = data.quizzes.find(q => q.quizId === quizId);
  if (!findQuiz) {
    throw HTTPError(500, 'Quiz data inconsistency');
  }

  const findQuestionIndex = findQuiz.questions.findIndex(
    q => q.questionId === questionid
  );
  if (findQuestionIndex === -1) {
    throw HTTPError(400, 'Invalid questionId');
  }

  const findQuestion = findQuiz.questions.find(
    q => q.questionId === questionid
  );
  if (!findQuestion) {
    throw HTTPError(500, 'Question data inconsistency');
  }

  // Update question fields
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


/**
 * Delete existing question
 * @param {string} token - unique identifier for logined user
 * @param {number} quizId - unique identifier for a quiz
 * @param {number} questionid - unique identifier for a question
 * @returns {} - For successful question delete
 */
export const adminQuizQuestionDelete = (
  token: string,
  quizId: number,
  questionid: number
): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);

  const quizzesIndex = data.quizzes.findIndex(q => q.quizId === quizId);
  if (quizzesIndex === -1) {
    throw HTTPError(403, 'Invalid quizId');
  }

  const userQuizzesIndex = user.quizzes.findIndex(q => q.quizId === quizId);
  if (userQuizzesIndex === -1) {
    throw HTTPError(403, 'User does not own quiz');
  }

  const findQuiz = data.quizzes.find(q => q.quizId === quizId);
  if (!findQuiz) {
    throw HTTPError(500, 'Quiz data inconsistency');
  }

  const findQuestionIndex = findQuiz.questions.findIndex(
    q => q.questionId === questionid
  );
  if (findQuestionIndex === -1) {
    throw HTTPError(400, 'Invalid questionId');
  }

  const question = findQuiz.questions[findQuestionIndex];
  if (!question) {
    throw HTTPError(500, 'Question data inconsistency');
  }

  findQuiz.duration -= question.duration;
  findQuiz.numQuestions -= 1;
  findQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  findQuiz.questions.splice(findQuestionIndex, 1);

  saveData();
  return {};
};


/**
 * Restore quiz from trash
 * @param {string} token - unique identifier for logined user
 * @param {number} quizId - unique identifier for a quiz
 * @returns {} - For successful restoration
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
 * @param {Array<number>} quizIds- array of quizIds to delete
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
 * A function inputs token, questionBody and quizId, and create a question under the quiz
 * @param {string} token - unique identifier for logined user
 * @param {quizQuestionCreateInputV1} questionBody - the question needed to be updated to the quiz
 * @param {number} quizId - a unique identifier of quiz
 * @returns {{ questionId: number }} - For successful question create
 */
export const quizQuestionCreate1 = (
  token: string,
  questionBody: quizQuestionCreateInputV1,
  quizId: number
): quizQuestionCreateReturn | ErrorReturn => {
  const data = getData();

  // Validate token (throws on invalid)
  validToken(token, data.users);

  // Validate quiz ownership (throws on invalid)
  isValidQuizId(token, quizId);

  // Validate question body (throws on invalid, returns duration)
  const result = checkQuestionValidV1(questionBody, quizId);

  const findQuiz = data.quizzes.find(q => q.quizId === quizId);
  if (!findQuiz) {
    throw HTTPError(500, 'Quiz data inconsistency');
  }

  // Update quiz metadata
  findQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  findQuiz.duration = result.duration;
  findQuiz.numQuestions += 1;

  // Generate new question ID
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

  return { questionId };
};

/**
 * A function inputs token, questionBody and quizId, and create a question under the quiz (with thumbnail)
 * @param {string} token - unique identifier for logined user
 * @param {quizQuestionCreateInput} questionBody - the question needed to be updated to the quiz
 * @param {number} quizId - a unique identifier of quiz
 *
 * @returns {{ questionId: number }} - for successful question create
 */
export const quizQuestionCreate2 = (
  token: string,
  questionBody: quizQuestionCreateInput,
  quizId: number
): quizQuestionCreateReturn | ErrorReturn => {
  const data = getData();

  // Validate token (throws on invalid)
  validToken(token, data.users);

  // Validate quiz ownership (throws on invalid)
  isValidQuizId(token, quizId);

  // Validate thumbnail URL (throws on invalid)
  validthumbnailUrl(questionBody.thumbnailUrl);

  // Validate question body (throws on invalid, returns duration)
  const result = checkQuestionValid(questionBody, quizId);

  const findQuiz = data.quizzes.find(q => q.quizId === quizId);
  if (!findQuiz) {
    throw HTTPError(500, 'Quiz data inconsistency');
  }

  // Update quiz metadata
  findQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  findQuiz.duration = result.duration;
  findQuiz.thumbnailUrl = questionBody.thumbnailUrl;
  findQuiz.numQuestions += 1;

  // Generate new question ID
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

  return { questionId };
};

/**
 * A function input token, userEmail and quizId and transfer the quiz
 * from the user with the token to the user with the email
 * @param {string} token - a unique identifier of logged in user
 * @param {string} userEmail - the target user's email
 * @param {number} quizId - the quizId of the quiz need to be transferred
 * @returns {} - for successful quiz transfer
 */
export const quizTransfer1 = (
  token: string,
  userEmail: string,
  quizId: number
): EmptyObject | ErrorReturn => {
  const data = getData();

  // Validate token and quiz ownership (throws on failure)
  validToken(token, data.users);
  isValidQuizId(token, quizId);

  const targetUser = data.users.find(u => u.email === userEmail);
  if (!targetUser) {
    throw HTTPError(400, 'UserEmail is not a real user');
  }

  if (targetUser.sessions.includes(token)) {
    throw HTTPError(400, 'UserEmail is the current logged in user');
  }

  const findQuiz = data.quizzes.find(q => q.quizId === quizId);
  if (!findQuiz) {
    throw HTTPError(500, 'Quiz data inconsistency');
  }

  const nameClash = targetUser.quizzes.find(q => q.name === findQuiz.name);
  if (nameClash) {
    throw HTTPError(
      400,
      'Quiz ID refers to a quiz that has a name that is already used by the target user'
    );
  }

  const currentUser = data.users.find(u => u.sessions.includes(token));
  if (!currentUser) {
    throw HTTPError(500, 'Current user not found');
  }

  const userQuiz = currentUser.quizzes.find(q => q.quizId === quizId);
  if (!userQuiz) {
    throw HTTPError(500, 'Quiz ownership data inconsistency');
  }

  // Transfer quiz
  findQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  targetUser.quizzes.push(userQuiz);

  const userQuizzesIndex = currentUser.quizzes.findIndex(q => q.quizId === quizId);
  if (userQuizzesIndex === -1) {
    throw HTTPError(500, 'Quiz index inconsistency');
  }

  currentUser.quizzes.splice(userQuizzesIndex, 1);

  setData(data);
  saveData();
  return {};
};


/**
 * A function input token, userEmail and quizId and transfer the quiz
 * from the user with the token to the user with the email
 * tests for active sessions
 * @param {string} token - a unique identifier of logged in user
 * @param {string} userEmail - the target user's email
 * @param {number} quizId - the quizId of the quiz need to be transferred
 * @returns {} - for successful quiz transfer
 */
export const quizTransfer2 = (
  token: string,
  userEmail: string,
  quizId: number
): EmptyObject | ErrorReturn => {
  const data = getData();

  // Validate token and quiz ownership (throws on failure)
  validToken(token, data.users);
  isValidQuizId(token, quizId);

  const targetUser = data.users.find(u => u.email === userEmail);
  if (!targetUser) {
    throw HTTPError(400, 'UserEmail is not a real user');
  }

  if (targetUser.sessions.includes(token)) {
    throw HTTPError(400, 'UserEmail is the current logged in user');
  }

  const findQuiz = data.quizzes.find(q => q.quizId === quizId);
  if (!findQuiz) {
    throw HTTPError(500, 'Quiz data inconsistency');
  }

  const nameClash = targetUser.quizzes.find(q => q.name === findQuiz.name);
  if (nameClash) {
    throw HTTPError(
      400,
      'Quiz ID refers to a quiz that has a name that is already used by the target user'
    );
  }

  // Check if the quiz contains an active session (throws on failure)
  isActiveQuizSession(quizId);

  const currentUser = data.users.find(u => u.sessions.includes(token));
  if (!currentUser) {
    throw HTTPError(500, 'Current user not found');
  }

  const userQuiz = currentUser.quizzes.find(q => q.quizId === quizId);
  if (!userQuiz) {
    throw HTTPError(500, 'Quiz ownership data inconsistency');
  }

  // Transfer quiz
  findQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  targetUser.quizzes.push(userQuiz);

  const userQuizzesIndex = currentUser.quizzes.findIndex(q => q.quizId === quizId);
  if (userQuizzesIndex === -1) {
    throw HTTPError(500, 'Quiz index inconsistency');
  }

  currentUser.quizzes.splice(userQuizzesIndex, 1);

  setData(data);
  saveData();
  return {};
};

/**
 * Move question within a quiz
 * @param {string} token - a unique identifier of logged in user
 * @param {number} quizId - a unique identifier of a quiz
 * @param {number} questionId - a unique identifier of a question
 * @param {number} newPosition - desired position within the quiz
 * @returns {} - for succesful question move
 */
export const adminQuizQuestionMove = (token: string, quizId: number, questionId: number, newPosition: number): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);

  const userQuizIndex = user.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (userQuizIndex === -1) {
    throw HTTPError(403, 'User does not own this quiz');
  }

  const findQuiz = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId); // find quiz using quizId

  const findQuestion = data.quizzes[findQuiz].questions.findIndex(quizQuestions => quizQuestions.questionId === questionId);
  if (findQuestion === -1) {
    throw HTTPError(400, 'questionId is invalid');
  }

  if (findQuestion === newPosition || newPosition < 0 || newPosition > (data.quizzes[findQuiz].questions.length - 1)) {
    throw HTTPError(400, 'newPosition is invalid');
  }

  const questionToMove = data.quizzes[findQuiz].questions.splice(findQuestion, 1)[0]; // Remove the question from its current position
  data.quizzes[findQuiz].questions.splice(newPosition, 0, questionToMove); // Insert the question into the new position

  data.quizzes[findQuiz].timeLastEdited = Math.floor(Date.now() / 1000); // Update last edited data value
  setData(data);
  saveData();
  return {};
};

/**
 * Duplicate a question within a quiz
 * @param {string} token - a unique identifier of logged in user
 * @param {number} quizId - a unique identifier of a quiz
 * @param {number} questionId - a unique identifier of a question
 * @returns {{ newQuestionId: number}} - for successful question move
 */
export const adminQuizQuestionDuplicate = (token: string, quizId: number, questionId: number): quizQuestionDuplicateReturn | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);

  const userQuizIndex = user.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (userQuizIndex === -1) {
    throw HTTPError(403, 'User does not own this quiz');
  }

  const findQuiz = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId); // find quiz using quizId

  const findQuestion = data.quizzes[findQuiz].questions.findIndex(quizQuestions => quizQuestions.questionId === questionId);
  if (findQuestion === -1) {
    throw HTTPError(400, 'questionId does not refer to a valid question in this quiz');
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
  saveData();

  // Return the ID of the new question
  return { newQuestionId: duplicatedQuestion.questionId };
};

/**
 * Update the thumbnail of a quiz
 * @param {string} token - a unique identifier of logged in user
 * @param {number} quizId - a unique identifier of a quiz
 * @param {string} thumbnailUrl - new url to thumbnail picture
 * @returns {} - for successful thumbnail update
 */
export const adminQuizThumbnailUpdate = (
  token: string,
  quizId: number,
  thumbnailUrl: string
): EmptyObject | ErrorReturn => {
  const data = getData();

  // Validate token (throws on invalid)
  const user = validToken(token, data.users);

  // Check quiz ownership
  const quizUser = user.quizzes.find(q => q.quizId === quizId);
  if (!quizUser) {
    throw HTTPError(403, 'User does not own quiz');
  }

  // Validate thumbnail URL (throws on invalid)
  validthumbnailUrl(thumbnailUrl);

  // Find quiz in global store
  const quiz = data.quizzes.find(q => q.quizId === quizId);
  if (!quiz) {
    throw HTTPError(500, 'Quiz data inconsistency');
  }

  // Update thumbnail
  quiz.thumbnailUrl = thumbnailUrl;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  saveData();
  return {};
};

/**
 * view active and inactive session for a quiz
 * @param {string} token - a unique identifier of a logged in user
 * @param {number} quizId - a unique identifier of a quiz
 * @returns {{activeSessions: Array<number>, inactiveSessions: Array<number>,}} - a list of active sessions and inactive sessions
 */
export const viewSessions = (token: string, quizId: number) => {
  const data = getData();
  const user = validToken(token, data.users);

  const userQuiz = user.quizzes.find(quizzes => quizzes.quizId === quizId);
  if (userQuiz === undefined) {
    throw HTTPError(403, 'User does not own quiz');
  }

  const activeSessions = [];
  const inactiveSessions = [];
  for (const quizSessions of data.quizSessions) {
    if (quizSessions.quizStatus.metadata.quizId === quizId) {
      if (quizSessions.quizStatus.state === 'END') {
        inactiveSessions.push(quizSessions.sessionId);
      } else {
        activeSessions.push(quizSessions.sessionId);
      }
    }
  }

  return {
    activeSessions: activeSessions,
    inactiveSessions: inactiveSessions,
  };
};

/**
 * Start a session for a quiz
 * @param {string} token - a unique identifier of a logged in user
 * @param {number} quizId - a unique identifier of a quiz
 * @param {number} autoStartNum - the number of players which triggers the session automatically to start
 * @returns {{ sessionId: number }} - for successful session start
 */
export const sessionStart = (
  token: string,
  quizId: number,
  autoStartNum: number
): { sessionId: number } | ErrorReturn => {
  const data = getData();

  // Validate token
  const user = validToken(token, data.users);

  // Check quiz ownership / trash state
  const userQuiz = user.quizzes.find(q => q.quizId === quizId);
  const userTrash = user.trash.find(q => q.quizId === quizId);

  if (!userQuiz) {
    if (!userTrash) {
      throw HTTPError(403, 'User does not own quiz');
    }
    throw HTTPError(400, 'The quiz is in trash');
  }

  // Check active session limit
  const activeSessions = viewSessions(token, quizId).activeSessions;
  if (activeSessions.length === 10) {
    throw HTTPError(400, 'A maximum of 10 sessions that are not in END state is allowed');
  }

  // Validate autoStartNum
  if (autoStartNum > 50) {
    throw HTTPError(400, 'autoStartNum cannot be greater than 50');
  }
  if (autoStartNum < 0) {
    throw HTTPError(400, 'autoStartNum cannot be less than 0');
  }

  // Find quiz in global store
  const quiz = data.quizzes.find(q => q.quizId === quizId);
  if (!quiz) {
    throw HTTPError(500, 'Quiz data inconsistency');
  }

  if (quiz.numQuestions === 0) {
    throw HTTPError(400, 'The quiz does not have any questions in it');
  }

  const initialQuestionResults = quiz.questions.map(question => ({
    questionId: question.questionId,
    playersCorrectList: [] as string[],
    averageAnswerTime: 0,
    percentCorrect: 0,
  }));

  // Create session
  data.quizSessionIdStore += 1;

  const newQuizSession: QuizSession = {
    sessionId: data.quizSessionIdStore,
    autoStartNum,
    timeQuestionOpen: 0,
    timeSubmissionsTotal: 0,
    quizStatus: {
      state: State.LOBBY,
      atQuestion: 0,
      players: [],
      metadata: {
        quizId: quiz.quizId,
        name: quiz.name,
        timeCreated: quiz.timeCreated,
        timeLastEdited: quiz.timeLastEdited,
        description: quiz.description,
        numQuestions: quiz.numQuestions,
        questions: quiz.questions,
        duration: quiz.duration,
        thumbnailUrl: quiz.thumbnailUrl,
      },
    },
    quizResults: {
      usersRankedByScore: [],
      questionResults: initialQuestionResults,
    },
    messages: [],
  };

  data.quizSessions.push(newQuizSession);
  saveData();

  return { sessionId: data.quizSessionIdStore };
};

/**
 * Change session state given an action
 * @param {string} token - a unique identifier of a logged in user
 * @param {number} quizId - a unique identifier of a quiz
 * @param {number} sessionId - a unique identifier of a quiz session
 * @param {Action} action - the action in order to move between states
 * @returns {} - for successful session state update
 */
export const UpdateSessionState = (
  token: string,
  quizId: number,
  sessionId: number,
  action: Action
): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);

  const userQuiz = user.quizzes.find(q => q.quizId === quizId);
  if (!userQuiz) {
    throw HTTPError(403, 'User does not own quiz');
  }

  const activeSessions = viewSessions(token, quizId).activeSessions;
  if (!activeSessions.includes(sessionId)) {
    throw HTTPError(400, 'Session Id does not refer to a valid session within this quiz');
  }

  let timerId1: ReturnType<typeof setTimeout> | undefined;
  let timerId2: ReturnType<typeof setTimeout> | undefined;
  const DELAY = 3;

  for (const quizSession of data.quizSessions) {
    if (quizSession.sessionId !== sessionId) continue;

    const CountdownToOpen = () => {
      if (quizSession.quizStatus.state === State.QUESTION_COUNTDOWN) {
        quizSession.quizStatus.state = State.QUESTION_OPEN;
        quizSession.timeQuestionOpen = Math.floor(Date.now() / 1000);
        quizSession.timeSubmissionsTotal = 0;

        for (const player of quizSession.quizStatus.players) {
          player.answerIds = [];
        }

        timerId2 = setTimeout(
          OpentoClose,
          quizSession.quizStatus.metadata.questions[
            quizSession.quizStatus.atQuestion - 1
          ].duration * 1000
        );
        data.timers.push(timerId2);
      }
    };

    const OpentoClose = () => {
      quizSession.quizStatus.state = State.QUESTION_CLOSE;
    };

    // END is always allowed
    if (action === Action.END) {
      quizSession.quizStatus.state = State.END;
      if (timerId1) clearTimeout(timerId1);
      if (timerId2) clearTimeout(timerId2);
      quizSession.quizStatus.atQuestion = 0;
      return {};
    }

    if (quizSession.quizStatus.state === State.LOBBY && action === Action.NEXT_QUESTION) {
      quizSession.quizStatus.state = State.QUESTION_COUNTDOWN;
      quizSession.quizStatus.atQuestion += 1;
      timerId1 = setTimeout(CountdownToOpen, DELAY * 1000);
      data.timers.push(timerId1);
      return {};
    }

    if (quizSession.quizStatus.state === State.QUESTION_COUNTDOWN && action === Action.SKIP_COUNTDOWN) {
      quizSession.quizStatus.state = State.QUESTION_OPEN;
      quizSession.timeQuestionOpen = Math.floor(Date.now() / 1000);
      quizSession.timeSubmissionsTotal = 0;
      if (timerId1) clearTimeout(timerId1);

      timerId2 = setTimeout(
        OpentoClose,
        quizSession.quizStatus.metadata.questions[
          quizSession.quizStatus.atQuestion - 1
        ].duration * 1000
      );
      data.timers.push(timerId2);
      return {};
    }

    if (quizSession.quizStatus.state === State.QUESTION_OPEN && action === Action.GO_TO_ANSWER) {
      quizSession.quizStatus.state = State.ANSWER_SHOW;
      if (timerId2) clearTimeout(timerId2);
      return {};
    }

    if (quizSession.quizStatus.state === State.QUESTION_CLOSE) {
      if (action === Action.GO_TO_ANSWER) {
        quizSession.quizStatus.state = State.ANSWER_SHOW;
        return {};
      }

      if (action === Action.NEXT_QUESTION) {
        if (quizSession.quizStatus.atQuestion >= quizSession.quizStatus.metadata.numQuestions) {
          throw HTTPError(400, 'No more questions in quiz');
        }
        quizSession.quizStatus.state = State.QUESTION_COUNTDOWN;
        quizSession.quizStatus.atQuestion += 1;
        timerId1 = setTimeout(CountdownToOpen, DELAY * 1000);
        data.timers.push(timerId1);
        return {};
      }

      if (action === Action.GO_TO_FINAL_RESULTS) {
        quizSession.quizStatus.state = State.FINAL_RESULTS;
        quizSession.quizStatus.atQuestion = 0;
        return {};
      }
    }

    if (quizSession.quizStatus.state === State.ANSWER_SHOW) {
      if (action === Action.NEXT_QUESTION) {
        if (quizSession.quizStatus.atQuestion >= quizSession.quizStatus.metadata.numQuestions) {
          throw HTTPError(400, 'No more questions in quiz');
        }
        quizSession.quizStatus.state = State.QUESTION_COUNTDOWN;
        quizSession.quizStatus.atQuestion += 1;
        timerId1 = setTimeout(CountdownToOpen, DELAY * 1000);
        data.timers.push(timerId1);
        return {};
      }

      if (action === Action.GO_TO_FINAL_RESULTS) {
        quizSession.quizStatus.state = State.FINAL_RESULTS;
        quizSession.quizStatus.atQuestion = 0;
        return {};
      }
    }
  }

  throw HTTPError(400, 'Action enum cannot be applied in the current state');
};

/**
 * View current session status
 * @param {string} token - a unique identifier of a logged in user
 * @param {number} quizId - a unique identifier of a quiz
 * @param {number} sessionId - a unique identifier of a quiz session
 * @returns {QuizStatus} - for successful session status view
 */
export const GetSessionStatus = (token: string, quizId: number, sessionId: number) => {
  const data = getData();
  const user = validToken(token, data.users);

  const userQuiz = user.quizzes.find(quizzes => quizzes.quizId === quizId);
  if (userQuiz === undefined) {
    throw HTTPError(403, 'User does not own quiz');
  }

  const sessions = viewSessions(token, quizId);
  if (!sessions.activeSessions.includes(sessionId) && !sessions.inactiveSessions.includes(sessionId)) {
    throw HTTPError(400, 'Session Id does not refer to a valid session within this quiz');
  }

  for (const quizSessions of data.quizSessions) {
    if (quizSessions.sessionId === sessionId) {
      const playerNames = quizSessions.quizStatus.players.map(player => player.name);
      return {
        state: quizSessions.quizStatus.state,
        atQuestion: quizSessions.quizStatus.atQuestion,
        players: playerNames,
        metadata: quizSessions.quizStatus.metadata,
      };
    }
  }
};

export const QuizSessionFinalResults = (
  token: string,
  quizId: number,
  sessionId: number
): QuizSession['quizResults'] | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);

  const userQuiz = user.quizzes.find(q => q.quizId === quizId);
  if (!userQuiz) {
    throw HTTPError(403, 'User does not own quiz');
  }

  const activeSessions = viewSessions(token, quizId).activeSessions;
  if (!activeSessions.includes(sessionId)) {
    throw HTTPError(400, 'Session Id does not refer to a valid session within this quiz');
  }

  const result = GetSessionStatus(token, quizId, sessionId);
  if (!result) {
    throw HTTPError(500, 'Session status not found');
  }

  if (result.state !== State.FINAL_RESULTS) {
    throw HTTPError(400, 'Not in final_results state');
  }

  const session = data.quizSessions.find(s => s.sessionId === sessionId);
  if (!session) {
    throw HTTPError(500, 'Session data inconsistency');
  }

  const players = session.quizStatus.players;
  if (players.length === 0) {
    return session.quizResults;
  }

  return playerSessionResults(players[0].playerId);
};

/**
 * View messages sent during a quiz session
 * @param {number} playerId - a unique identifier of a play
 * @returns {MessageListReturn} - for successful message view
 */
export const sessionMessagesList = (playerId: number): MessageListReturn => {
  const session = ValidPlayerId(playerId);
  return { messages: session.messages };
};

/**
 * send message during a quiz session
 * @param {number} playerId - a unique identifier of a player
 * @param {MessageInput} message - message to be sent
 * @returns {} - for successful message sent
 */
export const sessionSendMessage = (
  playerId: number,
  message: MessageInput
): EmptyObject | ErrorReturn => {
  const session = ValidPlayerId(playerId);
  if (!session) {
    throw HTTPError(400, 'Player ID does not exist');
  }

  if (message.messageBody.length < 1 || message.messageBody.length > 100) {
    throw HTTPError(
      400,
      'message body is less than 1 character or more than 100 characters.'
    );
  }

  const player = playerIdToPlayer(playerId, session);
  if (!player) {
    throw HTTPError(500, 'Player data inconsistency');
  }

  const newMessage = {
    messageBody: message.messageBody,
    playerId: playerId,
    playerName: player.name,
    timeSent: Math.floor(Date.now() / 1000),
  };

  session.messages.push(newMessage);
  saveData();

  return {};
};


/**
 * Get the a link to the final results (in CSV format)
 * @param {string} tokena - unique identifier of a logged in user
 * @param {number} quizId - unique identifier of a quiz
 * @param {number} sessionId - unique identifier of a quiz session
 * @returns {{ url: string }} - for successful get csv results
 */
export const sessionCSVResultList = (token: string, quizId: number, sessionId: number) => {
  const data = getData();
  validToken(token, data.users);
  const session = validSession(sessionId, quizId);
  if (session.quizStatus.state !== 'FINAL_RESULTS') {
    throw HTTPError(400, 'Session is not in FINAL_RESULTS state');
  }
  isValidQuizId(token, quizId);
  const fileAddress = arrayToCSVAddress(token, session.quizResults, sessionId);
  return fileAddress;
};
