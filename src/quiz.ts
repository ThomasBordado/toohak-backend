import { token } from 'morgan';
import { getData, setData } from './dataStore';
import { EmptyObject, ErrorReturn, QuizListReturn, quiz, quizId } from './interfaces';
import { validUserId, checkQuizName } from './quizUtil';

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
  };

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
  user.trash.push(quiz);
  data.quizzes.splice(quizzesIndex, 1);
  user.quizzes.splice(userQuizzesIndex, 1);

  return {};
};

/** Get all of the relevant information about the current quiz.
 * @param {number} authUserId - unique identifier for an academic
 * @param {number} quizId - unique identifier for a quiz
 * @returns {{quizId: number, name: string, timeCreated: number, timeLastEdited: number, description: string}} - for valid authUserId and quizId
 */
export const adminQuizInfo = (authUserId: number, quizId: number): quiz | ErrorReturn => {
  const data = getData();
  const user = validUserId(authUserId, data.users);
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
export const adminQuizNameUpdate = (authUserId: number, quizId: number, name: string): EmptyObject | ErrorReturn => {
  const data = getData();
  const user = validUserId(authUserId, data.users);
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

export const adminQuizQuestionUpdate = (token: number, questionBody: quizQuestionCreatInput, quizId: number, questionid: number): EmptyObject | ErrorReturn => {
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

  const result = checkQuestionValid(questionBody, quizId);
  if ('error' in result) {
    return result as ErrorReturn;
  }

  

  const findQuiz = data.quizzes.find(quizzes => quizzes.quizId === quizId);
  const findQuestionIndex = findQuiz.quizQuestions.findIndex(questions => questions.questionId);
  if (findQuestionIndex === -1) {
    return { error: 'Invalid questionId' };
  } else if (findQuestionIndex > -1) {
    const findQuestion = findQuiz.quizQuestions.find(questions => questions.questionId);
    findQuiz.quizQuestions[findQuestion].question = questionBody.questionBody.question;
    findQuiz.quizQuestions[findQuestion].duration = questionBody.questionBody.duration;
    findQuiz.quizQuestions[findQuestion].points = questionBody.questionBody.points;
    findQuiz.quizQuestions[findQuestion].answers = questionBody.questionBody.answers;
  }
  

  // const questionsIndex = data.quizzes.quizQuestions.findIndex(questions => quizzesIndex.quizQuestions.answers) //need to finish index

  // data.quizzes[quizzesIndex].quizQuestions[questionsIndex].question = question;
  // data.quizzes[quizzesIndex].quizQuestions[questionsIndex].duration = duration;
  // data.quizzes[quizzesIndex].quizQuestions[questionsIndex].points = points;
  // data.quizzes[quizzesIndex].quizQuestions[questionsIndex].answers.answer = answer;
  // data.quizzes[quizzesIndex].quizQuestions[questionsIndex].answers.correct = correct;
  // // user.quizzes[userQuizzesIndex].name = name;
  // data.quizzes[quizzesIndex].timeLastEdited = Math.floor(Date.now() / 1000);

  return{};
};

export const adminQuizQuestionDelete = (token: number, quizId: number, questionid: number): EmptyObject | ErrorReturn => {
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

  const findQuiz = data.quizzes.find(quizzes => quizzes.quizId === quizId);
  const findQuestion = findQuiz.quizQuestions.findIndex(questions => questions.questionId);
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

  return{};
};
