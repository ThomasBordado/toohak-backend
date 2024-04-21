import { requestRegister, requestClear, requestLogin } from './wrapper';
import { requestQuizList, requestQuizCreate, requestQuizTrash, requestQuizViewTrash, requestQuizRestore, requestQuizTrashEmpty, requestQuizQuestionCreate, requestquizTransfer, requestLogout, requestQuizInfo, requestUpdateQuizName, requestUpdateQuizQuestion, requestDeleteQuizQuestion, requestUpdateQuizDescription, requestMoveQuestion, requestQuestionDuplicate, requestThumbnailUpdate, requestSessionView, requestSessionStart, requestUpdateSessionState, requestGetSessionStatus, requestQuizSessionFinalResults, requestMessageList, requestSendMessage, requestPlayerJoin, requestSessionCSVResult, requestPlayerAnswerSubmission, requestPlayerQuestionInfo } from './wrapper2';
import { QuizListReturn, SessionId, quizId, quizUser, quizQuestionCreateInput, quiz, quizQuestionCreateReturn, questionId, sessionViewReturn, QuizSession, /* QuizStatus, */ Action, MessageInput, PlayerId, QuizSessionId } from './interfaces';
import HTTPError from 'http-errors';

beforeEach(() => {
  requestClear();
});

// helper function for testing timers
function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

/*
 * Testing for listing quiz
 */
describe('requestQuizList testing', () => {
  let user: SessionId;
  beforeEach(() => {
    user = requestRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid AuthUserId', () => {
      requestQuizCreate(user.token, 'My Quiz', 'My description.');
      expect(() => requestQuizList(user.token + 1)).toThrow(HTTPError[401]);
    });
  });
  describe('Successful Cases', () => {
    test('No quizzes owned: return empty array', () => {
      expect(requestQuizList(user.token)).toStrictEqual({ quizzes: [] });
    });
    test('One quiz owned', () => {
      const quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.') as quizId;
      expect(requestQuizList(user.token)).toStrictEqual({ quizzes: [{ quizId: quiz.quizId, name: 'My Quiz' }] });
    });
    test('Multiple quizzes owned', () => {
      const quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.') as quizId;
      const quiz2 = requestQuizCreate(user.token, 'My Second Quiz', 'My description.') as quizId;
      const quiz3 = requestQuizCreate(user.token, 'My Third Quiz', 'My description.') as quizId;
      const quizList = requestQuizList(user.token) as QuizListReturn;
      const expectedList = {
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'My Quiz',
          },
          {
            quizId: quiz2.quizId,
            name: 'My Second Quiz',
          },
          {
            quizId: quiz3.quizId,
            name: 'My Third Quiz',
          }
        ]
      };
      // sorting both arrays in order of unique quizId so that the order of array matches
      quizList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expectedList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expect(quizList).toStrictEqual(expectedList);
    });
  });
});

/*
 * Testing for creating quiz
 */
describe('requestQuizCreate testing', () => {
  let user: SessionId;
  beforeEach(() => {
    user = requestRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid SessionId', () => {
      expect(() => requestQuizCreate(user.token + 1, 'My Quiz', 'My description.')).toThrow(HTTPError[401]);
    });
    test('Invalid name: Contains non-alphanumeric characters', () => {
      expect(() => requestQuizCreate(user.token, 'My Quiz!', 'My description.')).toThrow(HTTPError[400]);
    });
    test('Invalid name: blank name', () => {
      expect(() => requestQuizCreate(user.token, '', 'My description.')).toThrow(HTTPError[400]);
    });
    test('Invalid name: < 3 characters', () => {
      expect(() => requestQuizCreate(user.token, 'My', 'My description.')).toThrow(HTTPError[400]);
    });
    test('Invalid name: > 30 characters', () => {
      expect(() => requestQuizCreate(user.token, 'My very very very very long Quiz', 'My description.')).toThrow(HTTPError[400]);
    });
    test('Invalid name: name already used', () => {
      requestQuizCreate(user.token, 'My Quiz', 'My description');
      expect(() => requestQuizCreate(user.token, 'My Quiz', 'My description.')).toThrow(HTTPError[400]);
    });
    test('Invalid description: > 100 characters', () => {
      expect(() => requestQuizCreate(user.token, 'My very very very very long Quiz', 'My very, very, very, very, very, very, very, very, very, very, very, very, very, very, long description.')).toThrow(HTTPError[400]);
    });
  });
  describe('Successful cases', () => {
    test('Create single quiz', () => {
      expect(requestQuizCreate(user.token, 'My Quiz', 'My description.')).toStrictEqual({ quizId: expect.any(Number) });
    });
    test('Create two quizes w/ unique quizId', () => {
      const quiz1 = requestQuizCreate(user.token, 'My Quiz', 'My description.') as quizId;
      const quiz2 = requestQuizCreate(user.token, 'My Quiz2', 'My description.') as quizId;
      expect(quiz1).toStrictEqual({ quizId: expect.any(Number) });
      expect(quiz2).toStrictEqual({ quizId: expect.any(Number) });
      expect(quiz1.quizId).not.toStrictEqual(quiz2.quizId);
    });
    test('blank description', () => {
      expect(requestQuizCreate(user.token, 'My Quiz', '')).toStrictEqual({ quizId: expect.any(Number) });
    });
    test('Same name used by different user', () => {
      requestQuizCreate(user.token, 'My Quiz', 'My description.');
      const user2 = requestRegister('hayden.smith@unsw.edu.au', 'password2', 'Hayden', 'Smith').jsonBody as SessionId;
      expect(requestQuizCreate(user2.token, 'My Quiz', 'My other description.')).toStrictEqual({ quizId: expect.any(Number) });
    });
  });
});

/*
 * Testing for sending a quiz to trash
 */
describe('requestQuizTrash testing', () => {
  let user: SessionId;
  let quiz: quizId;
  beforeEach(() => {
    user = requestRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.') as quizId;
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid AuthUserId', () => {
      expect(() => requestQuizTrash(user.token + 1, quiz.quizId)).toThrow(HTTPError[401]);
    });
    test('Invalid quizId', () => {
      expect(() => requestQuizTrash(user.token, quiz.quizId + 1)).toThrow(HTTPError[403]);
    });
    test('User does not own quiz with given quizId', () => {
      const user2 = requestRegister('chloet@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
      expect(() => requestQuizTrash(user2.token, quiz.quizId)).toThrow(HTTPError[403]);
    });
    test('User owns quiz with same name as given quizId', () => {
      const user2 = requestRegister('chloet@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
      requestQuizCreate(user2.token, 'My Quiz', 'My description.');
      expect(() => requestQuizTrash(user2.token, quiz.quizId)).toThrow(HTTPError[403]);
    });
    test('Remove same quiz twice', () => {
      requestQuizTrash(user.token, quiz.quizId);
      expect(() => requestQuizTrash(user.token, quiz.quizId)).toThrow(HTTPError[403]);
    });
  });
  describe('Successful cases', () => {
    test('Remove single quiz', () => {
      expect(requestQuizTrash(user.token, quiz.quizId)).toStrictEqual({});
      expect(requestQuizList(user.token)).toStrictEqual({ quizzes: [] });
    });
    test('Remove multiple quizzes', () => {
      const quiz2 = requestQuizCreate(user.token, 'My Second Quiz', 'My description.') as quizId;
      const quiz3 = requestQuizCreate(user.token, 'My Third Quiz', 'My description.') as quizId;

      expect(requestQuizTrash(user.token, quiz2.quizId)).toStrictEqual({});
      const quizList = requestQuizList(user.token) as QuizListReturn;
      const expectedList = {
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'My Quiz',
          },
          {
            quizId: quiz3.quizId,
            name: 'My Third Quiz',
          },
        ]
      };
      quizList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expectedList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expect(quizList).toStrictEqual(expectedList);

      expect(requestQuizTrash(user.token, quiz.quizId)).toStrictEqual({});
      expect(requestQuizList(user.token)).toStrictEqual({ quizzes: [{ quizId: quiz3.quizId, name: 'My Third Quiz' }] });

      expect(requestQuizTrash(user.token, quiz3.quizId)).toStrictEqual({});
      expect(requestQuizList(user.token)).toStrictEqual({ quizzes: [] });
    });
  });
});

/*
 * Testing for getting quiz info
 */
describe('requestQuizInfo testing', () => {
  let user: SessionId;
  let quiz: quizId;
  beforeEach(() => {
    user = requestRegister('ethan@gmail.com', 'password1', 'Ethan', 'McGregor').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.') as quizId;
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid AuthUserId', () => {
      expect(() => requestQuizInfo(user.token + 1, quiz.quizId)).toThrow(HTTPError[401]);
    });
    test('Invalid quizId', () => {
      expect(() => requestQuizInfo(user.token, quiz.quizId + 1)).toThrow(HTTPError[403]);
    });
    test('User does not own quiz with given quizId', () => {
      const user2 = requestRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor').jsonBody as SessionId;
      expect(() => requestQuizInfo(user2.token, quiz.quizId)).toThrow(HTTPError[403]);
    });
    test('User owns quiz with same name as given quizId', () => {
      const user2 = requestRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor').jsonBody as SessionId;
      requestQuizCreate(user2.token, 'My Quiz', 'My description.');
      expect(() => requestQuizInfo(user2.token, quiz.quizId)).toThrow(HTTPError[403]);
    });
  });
  describe('Successful cases', () => {
    test('Return correct object containing quiz info', () => {
      const result = requestQuizInfo(user.token, quiz.quizId);
      expect(result).toStrictEqual({
        quizId: quiz.quizId,
        name: 'My Quiz',
        questions: [],
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'My description.',
        numQuestions: 0,
        duration: 0,
        thumbnailUrl: '',
      });
    });
  });
});

/*
 * Testing for updating quiz name
 */
describe('requestUpdateQuizName testing', () => {
  let user: SessionId;
  let quiz: quizId;
  beforeEach(() => {
    user = requestRegister('ethan@gmail.com', 'password1', 'Ethan', 'Mcgregor').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.') as quizId;
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid AuthUserId', () => {
      expect(() => requestUpdateQuizName(user.token + 1, quiz.quizId, 'Ethans quiz')).toThrow(HTTPError[401]);
    });
    test('Invalid quizId', () => {
      expect(() => requestUpdateQuizName(user.token, quiz.quizId + 1, 'Ethans quiz')).toThrow(HTTPError[403]);
    });
    test('User does not own quiz with given quizId', () => {
      const user2 = requestRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor').jsonBody as SessionId;
      expect(() => requestUpdateQuizName(user2.token, quiz.quizId, 'Ethans quiz')).toThrow(HTTPError[403]);
    });
    test('User owns quiz with same name as given quizId', () => {
      const user2 = requestRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor').jsonBody as SessionId;
      requestQuizCreate(user2.token, 'My Quiz', 'My description.');
      expect(() => requestUpdateQuizName(user2.token, quiz.quizId, 'Ethans quiz')).toThrow(HTTPError[403]);
    });
    test('Invalid name: Contains non-alphanumeric characters', () => {
      expect(() => requestUpdateQuizName(user.token, quiz.quizId, 'My Quiz!')).toThrow(HTTPError[400]);
    });
    test('Invalid name: blank name', () => {
      expect(() => requestUpdateQuizName(user.token, quiz.quizId, '')).toThrow(HTTPError[400]);
    });
    test('Invalid name: < 3 characters', () => {
      expect(() => requestUpdateQuizName(user.token, quiz.quizId, 'My')).toThrow(HTTPError[400]);
    });
    test('Invalid name: > 30 characters', () => {
      expect(() => requestUpdateQuizName(user.token, quiz.quizId, 'My very very very very long Quiz')).toThrow(HTTPError[400]);
    });
    test('Invalid name: name already used', () => {
      requestQuizCreate(user.token, 'My Quizy', 'My descriptiony');
      expect(() => requestUpdateQuizName(user.token, quiz.quizId, 'My Quiz')).toThrow(HTTPError[400]);
    });
  });

  describe('Successful cases', () => {
    test('Return correct object containing quiz info', () => {
      const result = requestUpdateQuizName(user.token, quiz.quizId, 'Ethansquiz');
      expect(result).toStrictEqual({});
    });
    test('successfully change single name', () => {
      requestUpdateQuizName(user.token, quiz.quizId, 'Ethansquiz');
      const result = requestQuizList(user.token);
      expect(result).toStrictEqual({ quizzes: [{ quizId: quiz.quizId, name: 'Ethansquiz' }] });
    });
    test('successfully change multiple names', () => {
      const quiz2 = requestQuizCreate(user.token, 'My Second Quiz', 'My Second description.') as quizId;
      const quiz3 = requestQuizCreate(user.token, 'My Third Quiz', 'My Third description.') as quizId;
      requestUpdateQuizName(user.token, quiz.quizId, 'Ethansquiz');
      requestUpdateQuizName(user.token, quiz2.quizId, 'Ethanssecondquiz');
      const quizList = requestQuizList(user.token) as QuizListReturn;
      const expectedList = {
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'Ethansquiz',
          },
          {
            quizId: quiz2.quizId,
            name: 'Ethanssecondquiz',
          },
          {
            quizId: quiz3.quizId,
            name: 'My Third Quiz',
          }
        ]
      };
      quizList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expectedList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expect(quizList).toStrictEqual(expectedList);
    });
  });
});

/*
 * Testing for updating quiz Description
 */
describe('requestUpdateQuizDescription testing', () => {
  let user: SessionId;
  let quiz: quizId;
  beforeEach(() => {
    user = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.') as quizId;
  });

  // 1. Succesful quiz description update
  test('Test Succesful adminQuizDescriptionUpdate', () => {
    const result = requestUpdateQuizDescription(user.token, quiz.quizId, 'My updated description.');
    expect(result).toStrictEqual({});
  });

  // 2. Session token is not valid
  test('Test user.token is not valid', () => {
    expect(() => requestUpdateQuizDescription(user.token + 1, quiz.quizId, 'My updated description.')).toThrow(HTTPError[401]);
  });

  // 3. Quiz Id does not refer to a valid quiz
  test('Test quizid does not refer to valid quiz', () => {
    expect(() => requestUpdateQuizDescription(user.token, quiz.quizId + 1, 'My updated description.')).toThrow(HTTPError[403]);
  });

  // 4. Quiz Id does not refer to a quiz this user owns
  test('Test quizid does not refer to a quiz this user owns', () => {
    const user2 = requestRegister('jared@gmail.com', 'password3', 'Jared', 'Simion').jsonBody as SessionId;
    const notmyquiz = requestQuizCreate(user2.token, 'My Quiz2', 'My description.') as quizId;
    expect(() => requestUpdateQuizDescription(user.token, notmyquiz.quizId, 'My updated description.')).toThrow(HTTPError[403]);
  });

  // 5. Quiz description is more than 100 characters long
  test('Test quiz description < 100 characters long', () => {
    expect(() => requestUpdateQuizDescription(user.token, quiz.quizId, 'My very, very, very, very, very, very, very, very, very, very, very, very, very, very, long description.')).toThrow(HTTPError[400]);
  });
});

describe('Testing it2 function, adminQuizQuestionUpdate', () => {
  let user: SessionId;
  let quiz: quizId;
  let questionin: quizQuestionCreateInput;
  let questionout: quizQuestionCreateReturn;
  beforeEach(() => {
    user = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.') as quizId;

    questionin = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Prince Charles.',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    questionout = requestQuizQuestionCreate(user.token, questionin, quiz.quizId) as quizQuestionCreateReturn;
  });

  // 1. Succesfully update question
  test('Test succesful update of question', () => {
    const updated = {
      question: 'Who is the King of England?',
      duration: 6,
      points: 4,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: 'King Charles.',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    const result = requestUpdateQuizQuestion(user.token, updated, quiz.quizId, questionout.questionId);
    expect(result).toStrictEqual({});
  });

  // 2. Invalid Token/empty token
  test('Test invalid Token', () => {
    const updated = {
      question: 'Who is the King of England?',
      duration: 6,
      points: 4,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: 'King Charles.',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    expect(() => requestUpdateQuizQuestion(user.token + 1, updated, quiz.quizId, questionout.questionId)).toThrow(HTTPError[401]);
  });

  test('Test empty Token', () => {
    const updated = {
      question: 'Who is the King of England?',
      duration: 6,
      points: 4,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: 'King Charles.',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    expect(() => requestUpdateQuizQuestion('', updated, quiz.quizId, questionout.questionId)).toThrow(HTTPError[401]);
  });

  // 3. Invalid quizid or user does not own quiz
  test('Test invalid quizId, Valid token', () => {
    const updated = {
      question: 'Who is the King of England?',
      duration: 6,
      points: 4,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: 'King Charles.',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    expect(() => requestUpdateQuizQuestion(user.token, updated, quiz.quizId + 1, questionout.questionId)).toThrow(HTTPError[403]);
  });
  test('Test user doesn not own quiz', () => {
    const updated = {
      question: 'Who is the King of England?',
      duration: 6,
      points: 4,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: 'King Charles.',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };

    const user2 = requestRegister('jareds@gmail.com', 'password2', 'Jared', 'Simion').jsonBody as SessionId;
    const quiz2 = requestQuizCreate(user2.token, 'My Quiz', 'My description.') as quizId;
    expect(() => requestUpdateQuizQuestion(user.token, updated, quiz2.quizId, questionout.questionId)).toThrow(HTTPError[403]);
  });
});

describe('Testing it2 function, adminQuizQuestionDelete', () => {
  let user: SessionId;
  let quiz: quizId;
  let questionin: quizQuestionCreateInput;
  let questionout: quizQuestionCreateReturn;
  beforeEach(() => {
    user = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.') as quizId;
    questionin = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Prince Charles.',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    questionout = requestQuizQuestionCreate(user.token, questionin, quiz.quizId) as quizQuestionCreateReturn;
  });

  // 2. Invalid Token/empty token
  test('Test invalid Token', () => {
    expect(() => requestDeleteQuizQuestion(user.token + 1, quiz.quizId, questionout.questionId)).toThrow(HTTPError[401]);
  });
  test('Test empty Token', () => {
    expect(() => requestDeleteQuizQuestion('', quiz.quizId, questionout.questionId)).toThrow(HTTPError[401]);
  });

  // 3. Invalid quizid or user does not own quiz
  test('Test invalid quizId, Valid token', () => {
    expect(() => requestDeleteQuizQuestion(user.token, quiz.quizId + 1, questionout.questionId)).toThrow(HTTPError[403]);
  });
  test('Test user doesn not own quiz', () => {
    const user2 = requestRegister('jareds@gmail.com', 'password2', 'Jared', 'Simion').jsonBody as SessionId;
    const quiz2 = requestQuizCreate(user2.token, 'My Quiz', 'My description.') as quizId;
    expect(() => requestDeleteQuizQuestion(user.token, quiz2.quizId, questionout.questionId)).toThrow(HTTPError[403]);
  });

  // 4. questiondID does not refer to valid question withing quiz
  test('invalid questionid', () => {
    expect(() => requestDeleteQuizQuestion(user.token, quiz.quizId, questionout.questionId + 1)).toThrow(HTTPError[400]);
  });
});

/*
 * Testing for viewing quizzes in trash
 */
describe('requestQuizViewTrash testing', () => {
  let user: SessionId;
  let quiz: quizId;
  beforeEach(() => {
    user = requestRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.') as quizId;
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid SessionId', () => {
      expect(() => requestQuizViewTrash(user.token + 1)).toThrow(HTTPError[401]);
    });
  });
  describe('Successful cases', () => {
    test('no quizes in trash', () => {
      expect(requestQuizViewTrash(user.token)).toStrictEqual({ quizzes: [] });
    });
    test('single quiz in trash', () => {
      requestQuizTrash(user.token, quiz.quizId);
      expect(requestQuizViewTrash(user.token)).toStrictEqual({ quizzes: [{ quizId: quiz.quizId, name: 'My Quiz' }] });
    });

    test('Remove multiple quizzes', () => {
      const quiz2 = requestQuizCreate(user.token, 'My Second Quiz', 'My description.') as quizId;
      const quiz3 = requestQuizCreate(user.token, 'My Third Quiz', 'My description.') as quizId;

      requestQuizTrash(user.token, quiz.quizId);
      requestQuizTrash(user.token, quiz3.quizId);
      let trashList = requestQuizViewTrash(user.token) as QuizListReturn;
      let expectedList = {
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'My Quiz',
          },
          {
            quizId: quiz3.quizId,
            name: 'My Third Quiz',
          },
        ]
      };
      trashList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expectedList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expect(trashList).toStrictEqual(expectedList);

      requestQuizTrash(user.token, quiz2.quizId);
      trashList = requestQuizViewTrash(user.token) as QuizListReturn;
      expectedList = {
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'My Quiz',
          },
          {
            quizId: quiz3.quizId,
            name: 'My Third Quiz',
          },
          {
            quizId: quiz2.quizId,
            name: 'My Second Quiz',
          },
        ]
      };
      trashList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expectedList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expect(trashList).toStrictEqual(expectedList);
    });
  });
});

/*
 * Testing for restoring quizzes from trash
 */
describe('requestQuizRestore testing', () => {
  let user: SessionId;
  let quiz: quizId;
  beforeEach(() => {
    user = requestRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.') as quizId;
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid AuthUserId', () => {
      expect(() => requestQuizRestore(user.token + 1, quiz.quizId)).toThrow(HTTPError[401]);
    });
    test('Invalid quizId', () => {
      expect(() => requestQuizRestore(user.token, quiz.quizId + 1)).toThrow(HTTPError[403]);
    });
    test('User does not own quiz with given quizId', () => {
      const user2 = requestRegister('chloet@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
      expect(() => requestQuizRestore(user2.token, quiz.quizId)).toThrow(HTTPError[403]);
    });
    test('User owns quiz with same name as restored quiz', () => {
      requestQuizTrash(user.token, quiz.quizId);
      requestQuizCreate(user.token, 'My Quiz', 'My description.');
      expect(() => requestQuizRestore(user.token, quiz.quizId)).toThrow(HTTPError[400]);
    });
    test('quiz is not currently in trash', () => {
      expect(() => requestQuizRestore(user.token, quiz.quizId)).toThrow(HTTPError[400]);
    });

    test('Restore same quiz twice', () => {
      requestQuizTrash(user.token, quiz.quizId);
      requestQuizRestore(user.token, quiz.quizId);
      expect(() => requestQuizRestore(user.token, quiz.quizId)).toThrow(HTTPError[400]);
    });
  });
  describe('Successful cases', () => {
    test('restore quiz', () => {
      requestQuizTrash(user.token, quiz.quizId);
      expect(requestQuizRestore(user.token, quiz.quizId)).toStrictEqual({});
      expect(requestQuizList(user.token)).toStrictEqual({ quizzes: [{ quizId: quiz.quizId, name: 'My Quiz' }] });
      expect(requestQuizViewTrash(user.token)).toStrictEqual({ quizzes: [] });
    });
  });
});

/*
 * Testing for trash empty
 */
describe('adminQuizTrashEmpty testing', () => {
  let user: SessionId;
  let quiz: quizId;
  beforeEach(() => {
    user = requestRegister('tom@gmail.com', 'password1', 'Tom', 'Thompson').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'First Quiz', 'Good description') as quizId;
  });

  describe('Unsuccessful Cases', () => {
    test('One quizId is not currently in the trash', () => {
      const quizIds: number[] = [quiz.quizId];
      // Convert the list to a JSON string
      const quizIdsString: string = JSON.stringify(quizIds);

      expect(() => requestQuizTrashEmpty(user.token, quizIdsString)).toThrow(HTTPError[400]);
    });

    test('All quiz ids are not in the trash', () => {
      const quiz2 = requestQuizCreate(user.token, 'Second Quiz', 'Better description') as quizId;
      const quiz3 = requestQuizCreate(user.token, 'Third Quiz', 'Best description') as quizId;

      // Send the first 2 quizzes into the trash
      requestQuizTrash(user.token, quiz.quizId);
      requestQuizTrash(user.token, quiz2.quizId);

      const quizIds: number[] = [quiz.quizId, quiz2.quizId, quiz3.quizId];
      // Convert the list to a JSON string
      const quizIdsString: string = JSON.stringify(quizIds);

      expect(() => requestQuizTrashEmpty(user.token, quizIdsString)).toThrow(HTTPError[400]);
    });
    test('Token refers to invalid session', () => {
      requestQuizTrash(user.token, quiz.quizId);

      const quizIds: number[] = [quiz.quizId];
      // Convert the list to a JSON string
      const quizIdsString: string = JSON.stringify(quizIds);

      const newToken = parseInt(user.token) + 1;
      expect(() => requestQuizTrashEmpty(newToken.toString(), quizIdsString)).toThrow(HTTPError[401]);
    });

    test('Token refers to empty session', () => {
      requestQuizTrash(user.token, quiz.quizId);

      const quizIds: number[] = [quiz.quizId];
      // Convert the list to a JSON string
      const quizIdsString: string = JSON.stringify(quizIds);

      expect(() => requestQuizTrashEmpty('', quizIdsString)).toThrow(HTTPError[401]);
    });

    test('Quiz is not owned by current session', () => {
      const user2 = requestRegister('John@gmail.com', 'password1', 'John', 'Flow').jsonBody as SessionId;
      const quiz2 = requestQuizCreate(user2.token, 'Quiz of John', 'Quiz of John') as quizId;
      requestQuizTrash(user.token, quiz.quizId);
      requestQuizTrash(user2.token, quiz2.quizId);

      const quizIds: number[] = [quiz.quizId, quiz2.quizId];
      // Convert the list to a JSON string
      const quizIdsString: string = JSON.stringify(quizIds);

      expect(() => requestQuizTrashEmpty(user.token, quizIdsString)).toThrow(HTTPError[403]);
    });
  });

  describe('Successful cases', () => {
    test('Empty One Item in Trash', () => {
      requestQuizTrash(user.token, quiz.quizId);
      let trashList = requestQuizViewTrash(user.token) as QuizListReturn;
      let expectedList = {
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'First Quiz',
          }
        ]
      };
      trashList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expectedList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expect(trashList).toStrictEqual(expectedList);

      const quizIds: number[] = [quiz.quizId];
      // Convert the list to a JSON string
      const quizIdsString: string = JSON.stringify(quizIds);

      expect(requestQuizTrashEmpty(user.token, quizIdsString)).toStrictEqual({});

      trashList = requestQuizViewTrash(user.token) as QuizListReturn;
      expectedList = { quizzes: [] };
      trashList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expectedList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expect(trashList).toStrictEqual(expectedList);
    });

    test('Empty all items in Trash', () => {
      const quiz2 = requestQuizCreate(user.token, 'Second Quiz', 'Better description') as quizId;
      const quiz3 = requestQuizCreate(user.token, 'Third Quiz', 'Best description') as quizId;

      // Send the first 2 quizzes into the trash
      requestQuizTrash(user.token, quiz.quizId);
      requestQuizTrash(user.token, quiz2.quizId);
      requestQuizTrash(user.token, quiz3.quizId);

      let trashList = requestQuizViewTrash(user.token) as QuizListReturn;
      let expectedList = {
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'First Quiz',
          },
          {
            quizId: quiz2.quizId,
            name: 'Second Quiz',
          },
          {
            quizId: quiz3.quizId,
            name: 'Third Quiz',
          }
        ]
      };
      trashList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expectedList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expect(trashList).toStrictEqual(expectedList);

      const quizIds: number[] = [quiz.quizId, quiz2.quizId, quiz3.quizId];
      // Convert the list to a JSON string
      const quizIdsString: string = JSON.stringify(quizIds);

      expect(requestQuizTrashEmpty(user.token, quizIdsString)).toStrictEqual({});

      trashList = requestQuizViewTrash(user.token) as QuizListReturn;
      expectedList = { quizzes: [] };
      trashList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expectedList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expect(trashList).toStrictEqual(expectedList);
    });

    test('Empty last item in Trash', () => {
      const quiz2 = requestQuizCreate(user.token, 'Second Quiz', 'Better description') as quizId;
      const quiz3 = requestQuizCreate(user.token, 'Third Quiz', 'Best description') as quizId;

      // Send the first 2 quizzes into the trash
      requestQuizTrash(user.token, quiz.quizId);
      requestQuizTrash(user.token, quiz2.quizId);
      requestQuizTrash(user.token, quiz3.quizId);

      let trashList = requestQuizViewTrash(user.token) as QuizListReturn;
      let expectedList = {
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'First Quiz',
          },
          {
            quizId: quiz2.quizId,
            name: 'Second Quiz',
          },
          {
            quizId: quiz3.quizId,
            name: 'Third Quiz',
          }
        ]
      };
      trashList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expectedList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expect(trashList).toStrictEqual(expectedList);

      const quizIds: number[] = [quiz3.quizId];
      // Convert the list to a JSON string
      const quizIdsString: string = JSON.stringify(quizIds);

      expect(requestQuizTrashEmpty(user.token, quizIdsString)).toStrictEqual({});

      trashList = requestQuizViewTrash(user.token) as QuizListReturn;
      expectedList = {
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'First Quiz',
          },
          {
            quizId: quiz2.quizId,
            name: 'Second Quiz',
          }
        ]
      };
      trashList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expectedList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expect(trashList).toStrictEqual(expectedList);
    });

    test('Empty first item in Trash', () => {
      const quiz2 = requestQuizCreate(user.token, 'Second Quiz', 'Better description') as quizId;
      const quiz3 = requestQuizCreate(user.token, 'Third Quiz', 'Best description') as quizId;

      // Send the first 2 quizzes into the trash
      requestQuizTrash(user.token, quiz.quizId);
      requestQuizTrash(user.token, quiz2.quizId);
      requestQuizTrash(user.token, quiz3.quizId);

      let trashList = requestQuizViewTrash(user.token) as QuizListReturn;
      let expectedList = {
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'First Quiz',
          },
          {
            quizId: quiz2.quizId,
            name: 'Second Quiz',
          },
          {
            quizId: quiz3.quizId,
            name: 'Third Quiz',
          }
        ]
      };
      trashList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expectedList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expect(trashList).toStrictEqual(expectedList);

      const quizIds: number[] = [quiz.quizId];
      // Convert the list to a JSON string
      const quizIdsString: string = JSON.stringify(quizIds);

      expect(requestQuizTrashEmpty(user.token, quizIdsString)).toStrictEqual({});

      trashList = requestQuizViewTrash(user.token) as QuizListReturn;
      expectedList = {
        quizzes: [
          {
            quizId: quiz2.quizId,
            name: 'Second Quiz',
          },
          {
            quizId: quiz3.quizId,
            name: 'Third Quiz',
          }

        ]
      };
      trashList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expectedList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expect(trashList).toStrictEqual(expectedList);
    });

    test('Empty odd items in Trash', () => {
      const quiz2 = requestQuizCreate(user.token, 'Second Quiz', 'Better description') as quizId;
      const quiz3 = requestQuizCreate(user.token, 'Third Quiz', 'Best description') as quizId;
      const quiz4 = requestQuizCreate(user.token, 'Fourth Quiz', 'Bad description') as quizId;
      const quiz5 = requestQuizCreate(user.token, 'Fifth Quiz', 'Worst description') as quizId;

      // Send the first 2 quizzes into the trash
      requestQuizTrash(user.token, quiz.quizId);
      requestQuizTrash(user.token, quiz2.quizId);
      requestQuizTrash(user.token, quiz3.quizId);
      requestQuizTrash(user.token, quiz4.quizId);
      requestQuizTrash(user.token, quiz5.quizId);

      let trashList = requestQuizViewTrash(user.token) as QuizListReturn;
      let expectedList = {
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'First Quiz',
          },
          {
            quizId: quiz2.quizId,
            name: 'Second Quiz',
          },
          {
            quizId: quiz3.quizId,
            name: 'Third Quiz',
          },
          {
            quizId: quiz4.quizId,
            name: 'Fourth Quiz',
          },
          {
            quizId: quiz5.quizId,
            name: 'Fifth Quiz',
          }
        ]
      };
      trashList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expectedList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expect(trashList).toStrictEqual(expectedList);

      const quizIds: number[] = [quiz.quizId, quiz3.quizId, quiz5.quizId];
      // Convert the list to a JSON string
      const quizIdsString: string = JSON.stringify(quizIds);

      expect(requestQuizTrashEmpty(user.token, quizIdsString)).toStrictEqual({});

      trashList = requestQuizViewTrash(user.token) as QuizListReturn;
      expectedList = {
        quizzes: [
          {
            quizId: quiz2.quizId,
            name: 'Second Quiz',
          },
          {
            quizId: quiz4.quizId,
            name: 'Fourth Quiz',
          }
        ]
      };
      trashList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expectedList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
      expect(trashList).toStrictEqual(expectedList);
    });
  });
});

/**
 * test for creating quiz question
 */
describe('Testing Post /v2/admin/quiz/{quizid}/question', () => {
  test('Correct status code and return value', () => {
    const user = requestRegister('valideEmail@gmail.com', 'password1', 'Jane', 'Lawson').jsonBody as SessionId;
    const quiz = requestQuizCreate(user.token, 'British', 'history') as quizId;
    const input : quizQuestionCreateInput = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Prince Charles.',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };

    expect(() => (requestQuizQuestionCreate(user.token, input, quiz.quizId)).not.toThrow(HTTPError));
    const returnType = requestQuizQuestionCreate(user.token, input, quiz.quizId) as questionId;

    const expectedInfo: quiz = {
      quizId: quiz.quizId,
      name: 'British',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'history',
      numQuestions: 1,
      questions: [
        {
          questionId: returnType.questionId,
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answerId: 1,
              answer: 'Prince Charles',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: 2,
              answer: 'Prince Charles.',
              colour: expect.any(String),
              correct: true,
            },
          ]
        }
      ],
      duration: 4,
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    expect(returnType).toStrictEqual({ questionId: expect.any(Number) });
    expect(requestQuizInfo(user.token, quiz.quizId)).toStrictEqual(expectedInfo);
  });

  describe('Error test for 400 error', () => {
    let user: SessionId;
    let quiz: quizId;
    beforeEach(() => {
      user = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith').jsonBody as SessionId;
      quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.') as quizId;
    });
    test.each([
      {
        test: 'Question string too short',

        quizQuestion: {

          question: 'Who?',
          duration: 5,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Louis XVI',
              correct: false,
            }
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
        }
      },
      {
        test: 'Question string too long',

        quizQuestion: {

          question: 'Whoaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa?',
          duration: 5,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Louis XVI',
              correct: false,
            }
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
        }
      },
      {
        test: 'Not enough answers',

        quizQuestion: {

          question: 'Who is the Monarch of England?',
          duration: 5,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
        }
      },
      {
        test: 'Too many answers',

        quizQuestion: {

          question: 'Who is the Monarch of England?',
          duration: 5,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles1',
              correct: true,
            },
            {
              answer: 'Louis XVI',
              correct: false,
            },
            {
              answer: 'Prince Charles2',
              correct: true,
            },
            {
              answer: 'Prince Charles3',
              correct: true,
            },
            {
              answer: 'Prince Charles4',
              correct: true,
            },
            {
              answer: 'Prince Charles5',
              correct: true,
            },
            {
              answer: 'Prince Charles6',
              correct: true,
            },
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
        }
      },
      {
        test: 'invalid duraion time(negative number)',

        quizQuestion: {

          question: 'Who is the Monarch of England?',
          duration: -1,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Louis XVI',
              correct: false,
            }
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
        }
      },
      {
        test: 'invalid duration time(too long)',

        quizQuestion: {

          question: 'Who is the Monarch of England?',
          duration: 350,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Louis XVI',
              correct: false,
            }
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
        }
      },
      {
        test: 'Points awarded invalid(too small)',

        quizQuestion: {

          question: 'Who is the Monarch of England?',
          duration: 5,
          points: 0,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Louis XVI',
              correct: false,
            }
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
        }
      },
      {
        test: 'Points awarded invalid(too large)',

        quizQuestion: {

          question: 'Who?',
          duration: 5,
          points: 15,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Louis XVI',
              correct: false,
            }
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
        }
      },
      {
        test: 'Invalid answer length(too short)',

        quizQuestion: {

          question: 'Who?',
          duration: 5,
          points: 5,
          answers: [
            {
              answer: '',
              correct: true,
            },
            {
              answer: 'Louis XVI',
              correct: false,
            }
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
        }
      },
      {
        test: 'Invalid answer length(too short)',

        quizQuestion: {

          question: 'Who?',
          duration: 5,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
              correct: true,
            },
            {
              answer: 'Louis XVI',
              correct: false,
            }
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
        }
      },
      {
        test: 'Duplicates answers in one question',

        quizQuestion: {

          question: 'Who?',
          duration: 5,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Louis XVI',
              correct: false,
            }
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
        }
      },
      {
        test: 'No correct answers exist',

        quizQuestion: {

          question: 'Who?',
          duration: 5,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Louis XVI',
              correct: false,
            }
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
        }
      },
    ])("requestUpdateUserDetails error: '$test'", ({ quizQuestion }) => {
      expect(() => requestQuizQuestionCreate(user.token, quizQuestion, quiz.quizId)).toThrow(HTTPError[400]);
    });
  });

  describe('Error test for 400 error(thumbnailUrl)', () => {
    let user: SessionId;
    let quiz: quizId;
    let quizQuestion: quizQuestionCreateInput;
    beforeEach(() => {
      user = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith').jsonBody as SessionId;
      quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.') as quizId;

      quizQuestion = {
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles',
            correct: true
          },
          {
            answer: 'Prince Charles.',
            correct: true
          }
        ],
        thumbnailUrl: '',
      };
    });
    test('thumbnailUrl is an empty', () => {
      expect(() => requestQuizQuestionCreate(user.token, quizQuestion, quiz.quizId)).toThrow(HTTPError[400]);
    });

    test('The thumbnailUrl does not end with one of the following filetypes (case insensitive): jpg, jpeg, png', () => {
      quizQuestion.thumbnailUrl = 'http://google.com/some/image/path.';
      expect(() => requestQuizQuestionCreate(user.token, quizQuestion, quiz.quizId)).toThrow(HTTPError[400]);
    });

    test('The thumbnailUrl does not begin with "http://" or "https://"', () => {
      quizQuestion.thumbnailUrl = 'google.com/some/image/path.jpg';
      expect(() => requestQuizQuestionCreate(user.token, quizQuestion, quiz.quizId)).toThrow(HTTPError[400]);
    });
  });

  describe('Error test for 401 error', () => {
    let user: SessionId;
    let quiz: quizId;
    let quizQuestion: quizQuestionCreateInput;
    beforeEach(() => {
      user = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith').jsonBody as SessionId;
      quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.') as quizId;

      quizQuestion = {
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles',
            correct: true
          },
          {
            answer: 'Prince Charles.',
            correct: true
          }
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
    });

    test('Token is empty', () => {
      expect(() => requestQuizQuestionCreate('', quizQuestion, quiz.quizId)).toThrow(HTTPError[401]);
    });

    test('Token is empty', () => {
      expect(() => requestQuizQuestionCreate(user.token + 100, quizQuestion, quiz.quizId)).toThrow(HTTPError[401]);
    });

    test('logged out user', () => {
      requestLogout(user.token);
      expect(() => requestQuizQuestionCreate(user.token, quizQuestion, quiz.quizId)).toThrow(HTTPError[401]);
    });
  });

  test('Error test for 403 error, Valid token is provided, but user is not an owner of this quiz', () => {
    const user = requestRegister('valideEmail@gmail.com', 'password1', 'Jane', 'Lawson').jsonBody as SessionId;
    const quiz = requestQuizCreate(user.token, 'British', 'history') as quizId;
    const user2 = requestRegister('valideEmail2@gmail.com', 'password1', 'John', 'Lawson').jsonBody as SessionId;
    requestQuizCreate(user.token, 'American', 'history') as quizId;

    const input : quizQuestionCreateInput = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Prince Charles.',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };

    expect(() => requestQuizQuestionCreate(user2.token, input, quiz.quizId)).toThrow(HTTPError[403]);
  });
});

/**
 * Test for quiz transfer
 */
describe('Testing Post /v2/admin/quiz/{quizid}/transfer', () => {
  test('Correct status code and return value', () => {
    const user1 = requestRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith').jsonBody as SessionId;
    requestLogout(user1.token);

    const user2 = requestRegister('validemail2@gmail.com', '1234567a', 'Jennifer', 'Lawson').jsonBody as SessionId;
    const quiz = requestQuizCreate(user2.token, 'My quiz Name', 'A description of my quiz') as quizId;

    expect(() => requestquizTransfer(user2.token, 'validemail@gmail.com', quiz.quizId).not.toThrow(HTTPError));
    const returntype = requestquizTransfer(user2.token, 'validemail@gmail.com', quiz.quizId);
    expect(returntype).toStrictEqual({});
  });

  describe('Error test for 400 error', () => {
    let user1: SessionId;
    let user2: SessionId;
    let quiz2: quizId;
    let quiz3: quizId;
    beforeEach(() => {
      requestClear();
      user1 = requestRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith').jsonBody as SessionId;
      requestQuizCreate(user1.token, 'My quiz Name1', 'A description of my quiz') as quizId;
      requestLogout(user1.token);

      user2 = requestRegister('validemail2@gmail.com', '1234567a', 'Jennifer', 'Lawson').jsonBody as SessionId;
      quiz2 = requestQuizCreate(user2.token, 'My quiz Name2', 'A description of my quiz') as quizId;
      quiz3 = requestQuizCreate(user2.token, 'My quiz Name1', 'A description of my quiz') as quizId;
    });

    test.each([
      {
        userEmaill: '11111@qq.com', // userEmail is not a real user
      },
      {
        userEmaill: 'validemail2@gmail.com', // userEmail is the current logged in user
      },
    ])(
      'Error with token="$token", userEmail=$userEmail"',
      ({ userEmaill }) => {
        expect(() => requestquizTransfer(user2.token, userEmaill, quiz2.quizId)).toThrow(HTTPError[400]);
      });

    test('Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
      expect(() => requestquizTransfer(user2.token, 'validemail@gmail.com', quiz3.quizId)).toThrow(HTTPError[400]);
    });

    test('Error test for 400 error, Any session for this quiz is not in END state', () => {
      const input : quizQuestionCreateInput = {
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles',
            correct: true
          },
          {
            answer: 'Prince Charles.',
            correct: true
          }
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      requestQuizQuestionCreate(user2.token, input, quiz2.quizId);
      requestSessionStart(user2.token, quiz2.quizId, 3);
      expect(() => requestquizTransfer(user2.token, 'validemail@gmail.com', quiz2.quizId)).toThrow(HTTPError[400]);
    });
  });

  describe('Error test for 401 error', () => {
    let quiz: quizId;
    let user2: SessionId;
    beforeEach(() => {
      requestClear();
      requestRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith').jsonBody as SessionId;

      user2 = requestRegister('validemail2@gmail.com', '1234567a', 'Jennifer', 'Lawson').jsonBody as SessionId;
      quiz = requestQuizCreate(user2.token, 'My quiz Name', 'A description of my quiz') as quizId;
    });

    test('Token is empty', () => {
      expect(() => requestquizTransfer('', 'validemail@gmail.com', quiz.quizId)).toThrow(HTTPError[401]);
    });

    test('Token is invalid', () => {
      expect(() => requestquizTransfer(user2.token + 100, 'validemail@gmail.com', quiz.quizId)).toThrow(HTTPError[401]);
    });
  });

  test('Error test for 403 error, Valid token is provided, but user is not an owner of this quiz', () => {
    const user1 = requestRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith').jsonBody as SessionId;
    requestLogout(user1.token);

    const user3 = requestRegister('validemail3@gmail.com', '1234567a', 'Jane', 'Smith').jsonBody as SessionId;
    const quiz3 = requestQuizCreate(user3.token, 'My quiz Name1', 'A description of my quiz') as quizId;
    requestLogout(user3.token);

    const user2 = requestRegister('validemail2@gmail.com', '1234567a', 'Jennifer', 'Lawson').jsonBody as SessionId;

    expect(() => requestquizTransfer(user2.token, 'validemail1@gmail.com', quiz3.quizId)).toThrow(HTTPError[403]);
  });

  test('Testing behavior for QuizTransfer', () => {
    const user1 = requestRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith').jsonBody as SessionId;
    requestLogout(user1.token);

    const user2 = requestRegister('validemail2@gmail.com', '1234567a', 'Jennifer', 'Lawson').jsonBody as SessionId;
    const quiz = requestQuizCreate(user2.token, 'My quiz Name', 'A description of my quiz') as quizId;
    expect(() => (requestquizTransfer(user2.token, 'validemail@gmail.com', quiz.quizId)).not.toThrow(HTTPError));
    requestquizTransfer(user2.token, 'validemail@gmail.com', quiz.quizId);

    const user1Token = requestLogin('validemail@gmail.com', '1234567a').jsonBody;
    const result1 = requestQuizList(user1Token.token) as QuizListReturn;
    const result2 = requestQuizList(user2.token) as QuizListReturn;

    expect(result1).toStrictEqual({ quizzes: [{ quizId: 1, name: 'My quiz Name' }] });
    expect(result2).toStrictEqual({ quizzes: [] });
  });
});

describe('adminQuizQuestionMove testing', () => {
  let user: SessionId;
  let quiz: quizId;
  let questionin: quizQuestionCreateInput;
  let question1: quizQuestionCreateReturn;
  let question2: quizQuestionCreateReturn;
  let question3: quizQuestionCreateReturn;

  beforeEach(() => {
    user = requestRegister('jareds@gmail.com', 'password2024', 'Jared', 'Simion').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My Quiz Description') as quizId;
    questionin = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Prince Charles.',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    question1 = requestQuizQuestionCreate(user.token, questionin, quiz.quizId) as quizQuestionCreateReturn;
    question2 = requestQuizQuestionCreate(user.token, questionin, quiz.quizId) as quizQuestionCreateReturn;
    question3 = requestQuizQuestionCreate(user.token, questionin, quiz.quizId) as quizQuestionCreateReturn;
  });
  // 1. Succesfully move question 1 to last.
  test('Test succesfully moving question to new position', () => {
    expect(requestMoveQuestion(user.token, quiz.quizId, question1.questionId, 2)).toStrictEqual({});
  });
  // 1. Succesfully move question last to 1.
  test('Test succesfully moving question to new position', () => {
    expect(requestMoveQuestion(user.token, quiz.quizId, question3.questionId, 0)).toStrictEqual({});
  });
  // 1. Succesfully move question 2 to 1.
  test('Test succesfully moving question to new position', () => {
    expect(requestMoveQuestion(user.token, quiz.quizId, question2.questionId, 0)).toStrictEqual({});
  });
  // 2. Invalid Token
  test('Test invalid Token', () => {
    expect(() => requestMoveQuestion(user.token + 1, quiz.quizId, question1.questionId, 2)).toThrow(HTTPError[401]);
  });

  // 3. Valid token but quizId invalid
  test('Test invalid quizId, Valid token', () => {
    expect(() => requestMoveQuestion(user.token, quiz.quizId + 1, question1.questionId, 2)).toThrow(HTTPError[403]);
  });

  // 4. New position is less than 0
  test('Test newPosition is less than 0', () => {
    expect(() => requestMoveQuestion(user.token, quiz.quizId, question1.questionId, -1)).toThrow(HTTPError[400]);
  });
  // 5. New position is greater than (n-1)
  test('Test newPosition is greater than (n-1)', () => {
    expect(() => requestMoveQuestion(user.token, quiz.quizId, question1.questionId, 5)).toThrow(HTTPError[400]);
  });
});

describe('adminQuizQuestionDuplicate testing', () => {
  let user: SessionId;
  let quiz: quizId;
  let questionin: quizQuestionCreateInput;
  let questionin2: quizQuestionCreateInput;
  let questionin3: quizQuestionCreateInput;
  let question1: quizQuestionCreateReturn;
  let question2: quizQuestionCreateReturn;

  beforeEach(() => {
    user = requestRegister('jareds@gmail.com', 'password2024', 'Jared', 'Simion').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My Quiz Description') as quizId;
    questionin = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Prince Charles.',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    questionin2 = {
      question: 'Who is the best Person?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Thomas',
          correct: true
        },
        {
          answer: 'Bordado',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    questionin3 = {
      question: 'Who is the wrost Person?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Thomas',
          correct: true
        },
        {
          answer: 'Bordado',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    question1 = requestQuizQuestionCreate(user.token, questionin, quiz.quizId) as quizQuestionCreateReturn;
    question2 = requestQuizQuestionCreate(user.token, questionin2, quiz.quizId) as quizQuestionCreateReturn;
    requestQuizQuestionCreate(user.token, questionin3, quiz.quizId) as quizQuestionCreateReturn;
  });

  // 1. Succesfully duplicate question
  test('Test succesful duplication of question', () => {
    expect(requestQuestionDuplicate(user.token, quiz.quizId, question2.questionId)).toStrictEqual({ newQuestionId: expect.any(Number) });
  });

  // 2. Invalid Token
  test('Test invalid Token', () => {
    expect(() => requestQuestionDuplicate(user.token + 1, quiz.quizId, question1.questionId)).toThrow(HTTPError[401]);
  });

  // 3. Valid token but quizId invalid
  test('Test invalid quizId, Valid token', () => {
    expect(() => requestQuestionDuplicate(user.token, quiz.quizId + 1, question1.questionId)).toThrow(HTTPError[403]);
  });

  // 4. Valid token invalid quizId/user does not own this quiz
  test('Test Empty quizId', () => {
    const user2 = requestRegister('jareds2@gmail.com', 'password2', 'Jared', 'Simion').jsonBody as SessionId;
    const quiz2 = requestQuizCreate(user2.token, 'My Quiz', 'My description.') as quizId;
    expect(() => requestQuestionDuplicate(user.token, quiz2.quizId, question1.questionId)).toThrow(HTTPError[403]);
  });
});

describe('adminQuizThumbnailUpdate testing', () => {
  let user: SessionId;
  let quiz: quizId;
  beforeEach(() => {
    user = requestRegister('ethan@gmail.com', 'password1', 'Ethan', 'McGregor').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.') as quizId;
  });

  describe('Unsuccessful cases', () => {
    test('Invalid AuthUserId', () => {
      expect(() => requestThumbnailUpdate(user.token + 1, quiz.quizId, 'http://google.com/some/image/path.jpg')).toThrow(HTTPError[401]);
    });
    test('Invalid quizId', () => {
      expect(() => requestThumbnailUpdate(user.token, quiz.quizId + 1, 'http://google.com/some/image/path.jpg')).toThrow(HTTPError[403]);
    });
    test('User does not own quiz with given quizId', () => {
      const user2 = requestRegister('chloet@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
      expect(() => requestThumbnailUpdate(user2.token, quiz.quizId, 'http://google.com/some/image/path.jpg')).toThrow(HTTPError[403]);
    });
    test('User owns quiz with same name as given quizId', () => {
      const user2 = requestRegister('chloet@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
      requestQuizCreate(user2.token, 'My Quiz', 'My description.');
      expect(() => requestThumbnailUpdate(user2.token, quiz.quizId, 'http://google.com/some/image/path.jpg')).toThrow(HTTPError[403]);
    });
    test.each([
      {
        test: 'empty imgUrl',
        imgUrl: '',
      },
      {
        test: 'does not begin with http:// or https://',
        imgUrl: 'google.com/some/image/path.jpg',
      },
      {
        test: 'does not begin with http:// or https://',
        imgUrl: 'http:/google.com/some/image/path.jpg',
      },
      {
        test: 'does not begin with http:// or https://',
        imgUrl: 'https:/google.com/some/image/path.jpg',
      },
      {
        test: 'does not begin with http:// or https://',
        imgUrl: 'HTTP://google.com/some/image/path.jpg',
      },
      {
        test: 'does not begin with http:// or https://',
        imgUrl: 'HTTPS://google.com/some/image/path.jpg',
      },
      {
        test: 'does not end with jpg, jpeg or png',
        imgUrl: 'http://google.com/some/image/path',
      },

      {
        test: 'does not end with jpg, jpeg or png',
        imgUrl: 'http://google.com/some/image/path.pg',
      },
      {
        test: 'does not end with jpg, jpeg or png',
        imgUrl: 'http://google.com/some/image/path.peg',
      },
      {
        test: 'does not end with jpg, jpeg or png',
        imgUrl: 'http://google.com/some/image/path.ng',
      },
    ])(`Invalid imgUrl: ${test}`, ({ imgUrl }) => {
      expect(() => requestThumbnailUpdate(user.token, quiz.quizId, imgUrl)).toThrow(HTTPError[400]);
    });
  });
  describe('Successful Cases', () => {
    test('successful thumbnail update', () => {
      expect(requestThumbnailUpdate(user.token, quiz.quizId, 'http://google.com/some/image/path.jpg')).toStrictEqual({});
      const expected: quiz = {
        quizId: quiz.quizId,
        name: 'My Quiz',
        questions: [],
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'My description.',
        numQuestions: 0,
        duration: 0,
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      expect(requestQuizInfo(user.token, quiz.quizId)).toStrictEqual(expected);
    });
    test.each([
      {
        test: 'extra /',
        imgUrl: 'http:///google.com/some/image/path.jpg'
      },
      {
        test: 'no . before jpg',
        imgUrl: 'http://google.com/some/image/pathjpg'
      },
      {
        test: 'Uppercase in jpeg',
        imgUrl: 'http://google.com/some/image/path.JpEg'
      },
    ])(`successful thumbnail edgcases: ${test}`, ({ imgUrl }) => {
      expect(requestThumbnailUpdate(user.token, quiz.quizId, imgUrl)).toStrictEqual({});
      const expected: quiz = {
        quizId: quiz.quizId,
        name: 'My Quiz',
        questions: [],
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'My description.',
        numQuestions: 0,
        duration: 0,
        thumbnailUrl: imgUrl,
      };
      expect(requestQuizInfo(user.token, quiz.quizId)).toStrictEqual(expected);
    });
    test('Update same thumbnail twice', () => {
      expect(requestThumbnailUpdate(user.token, quiz.quizId, 'http://google.com/some/image/path.jpg')).toStrictEqual({});
      const expected: quiz = {
        quizId: quiz.quizId,
        name: 'My Quiz',
        questions: [],
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'My description.',
        numQuestions: 0,
        duration: 0,
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      expect(requestQuizInfo(user.token, quiz.quizId)).toStrictEqual(expected);
      expect(requestThumbnailUpdate(user.token, quiz.quizId, 'http://google.com/some/image/path.jpg')).toStrictEqual({});
      expect(requestQuizInfo(user.token, quiz.quizId)).toStrictEqual(expected);
    });
    test('Update different thumbnail twice', () => {
      expect(requestThumbnailUpdate(user.token, quiz.quizId, 'http://google.com/some/image/path.jpg')).toStrictEqual({});
      const expected: quiz = {
        quizId: quiz.quizId,
        name: 'My Quiz',
        questions: [],
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'My description.',
        numQuestions: 0,
        duration: 0,
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      expect(requestQuizInfo(user.token, quiz.quizId)).toStrictEqual(expected);
      expect(requestThumbnailUpdate(user.token, quiz.quizId, 'http://google.com/different/image/path.jpg')).toStrictEqual({});
      const expected2: quiz = {
        quizId: quiz.quizId,
        name: 'My Quiz',
        questions: [],
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'My description.',
        numQuestions: 0,
        duration: 0,
        thumbnailUrl: 'http://google.com/different/image/path.jpg',
      };
      expect(requestQuizInfo(user.token, quiz.quizId)).toStrictEqual(expected2);
    });
  });
});

/**
 * Test for sessionView
 */
describe('requestSessionView testing', () => {
  let user: SessionId;
  let quiz: quizId;
  let questionin: quizQuestionCreateInput;
  beforeEach(() => {
    user = requestRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My Quiz Description');
    questionin = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Prince Charles.',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    requestQuizQuestionCreate(user.token, questionin, quiz.quizId);
  });
  describe('Unsuccessful Cases', () => {
    test('Invalid Token', () => {
      expect(() => requestSessionView(user.token + 1, quiz.quizId)).toThrow(HTTPError[401]);
    });
    test('Invalid quizId', () => {
      expect(() => requestSessionView(user.token, quiz.quizId + 1)).toThrow(HTTPError[403]);
    });
  });
  describe('Successful Cases', () => {
    test('No sessions started: return empty array', () => {
      expect(requestSessionView(user.token, quiz.quizId)).toStrictEqual({ activeSessions: [], inactiveSessions: [] });
    });
    test('one active session', () => {
      const session = requestSessionStart(user.token, quiz.quizId, 3);
      expect(requestSessionView(user.token, quiz.quizId)).toStrictEqual({ activeSessions: [session.sessionId], inactiveSessions: [] });
    });
    test('multiple active sessions', () => {
      const session1 = requestSessionStart(user.token, quiz.quizId, 3);
      const session2 = requestSessionStart(user.token, quiz.quizId, 3);
      const session3 = requestSessionStart(user.token, quiz.quizId, 3);
      const quizSessions = requestSessionView(user.token, quiz.quizId);
      const expectedSessions: sessionViewReturn = {
        activeSessions: [
          session1.sessionId,
          session2.sessionId,
          session3.sessionId,
        ],
        inactiveSessions: [],
      };
      // sorting both arrays in order of unique quizId so that the order of array matches
      quizSessions.activeSessions.sort((a: number, b: number) => a - b);
      expectedSessions.activeSessions.sort((a: number, b: number) => a - b);
      expect(quizSessions).toStrictEqual(expectedSessions);
    });
    test.todo('one inactive session');
    test.todo('multiple inactive sessions');
    test.todo('both active and inactive sessions');
  });
});

/*
 * Testing for starting a session
 */
describe('requestSessionStart testing', () => {
  let user: SessionId;
  let quiz: quizId;
  let questionin: quizQuestionCreateInput;
  let question: questionId;
  beforeEach(() => {
    user = requestRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My Quiz Description');
    questionin = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Prince Charles.',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    question = requestQuizQuestionCreate(user.token, questionin, quiz.quizId);
  });
  describe('Unsuccessful Cases', () => {
    test('Invalid SessionId', () => {
      expect(() => requestSessionStart(user.token + 1, quiz.quizId, 3)).toThrow(HTTPError[401]);
    });
    test('Invalid quizId', () => {
      expect(() => requestSessionStart(user.token, quiz.quizId + 1, 3)).toThrow(HTTPError[403]);
    });
    test('user does not own quiz', () => {
      const user2 = requestRegister('chloet@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
      expect(() => requestSessionStart(user2.token, quiz.quizId, 3)).toThrow(HTTPError[403]);
    });
    test('quiz in trash', () => {
      requestQuizTrash(user.token, quiz.quizId);
      expect(() => requestSessionStart(user.token, quiz.quizId, 3)).toThrow(HTTPError[400]);
    });
    test('no questions', () => {
      requestDeleteQuizQuestion(user.token, quiz.quizId, question.questionId);
      expect(() => requestSessionStart(user.token, quiz.quizId, 3)).toThrow(HTTPError[400]);
    });
    test('Invalid autoStartNum: < 0', () => {
      expect(() => requestSessionStart(user.token, quiz.quizId, -2)).toThrow(HTTPError[400]);
    });
    test('Invalid autoStartNum: > 50', () => {
      expect(() => requestSessionStart(user.token, quiz.quizId, 51)).toThrow(HTTPError[400]);
    });
    test('Max 10 sessions not in endState', () => {
      requestSessionStart(user.token, quiz.quizId, 3);
      requestSessionStart(user.token, quiz.quizId, 3);
      requestSessionStart(user.token, quiz.quizId, 3);
      requestSessionStart(user.token, quiz.quizId, 3);
      requestSessionStart(user.token, quiz.quizId, 3);
      requestSessionStart(user.token, quiz.quizId, 3);
      requestSessionStart(user.token, quiz.quizId, 3);
      requestSessionStart(user.token, quiz.quizId, 3);
      requestSessionStart(user.token, quiz.quizId, 3);
      requestSessionStart(user.token, quiz.quizId, 3);
      expect(() => requestSessionStart(user.token, quiz.quizId, 3)).toThrow(HTTPError[400]);
    });
  });
  describe('Successful cases', () => {
    test('Create quiz Session', () => {
      expect(requestSessionStart(user.token, quiz.quizId, 3)).toStrictEqual({ sessionId: expect.any(Number) });
    });
    test('Create two sessions w/ unique sessionId', () => {
      const session1 = requestSessionStart(user.token, quiz.quizId, 3);
      const session2 = requestSessionStart(user.token, quiz.quizId, 3);
      expect(session1).toStrictEqual({ sessionId: expect.any(Number) });
      expect(session2).toStrictEqual({ sessionId: expect.any(Number) });
      expect(session1.sessionId).not.toStrictEqual(session2.sessionId);
    });
    test('autoNum = 0', () => {
      expect(requestSessionStart(user.token, quiz.quizId, 0)).toStrictEqual({ sessionId: expect.any(Number) });
    });
    test('autoNum = 50', () => {
      expect(requestSessionStart(user.token, quiz.quizId, 50)).toStrictEqual({ sessionId: expect.any(Number) });
    });
    test.todo('check any changes made to quiz does not effect session info');
  });
});

// UpdateSessionState Testing
describe('request UpdateSessionState testing', () => {
  let user: SessionId;
  let quiz: quizId;
  let questionin: quizQuestionCreateInput;
  let session: QuizSession;
  beforeEach(() => {
    user = requestRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My Quiz Description');
    questionin = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Prince Charles.',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    requestQuizQuestionCreate(user.token, questionin, quiz.quizId);
    session = requestSessionStart(user.token, quiz.quizId, 3);
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid SessionId', () => {
      expect(() => requestUpdateSessionState(user.token + 1, quiz.quizId, session.sessionId, 'END')).toThrow(HTTPError[401]);
    });
    test('Invalid quizId', () => {
      expect(() => requestUpdateSessionState(user.token, quiz.quizId + 1, session.sessionId, 'END')).toThrow(HTTPError[403]);
    });
    test('user does not own quiz', () => {
      const user2 = requestRegister('ethan@gmail.com', 'password1', 'Ethan', 'McGregor').jsonBody as SessionId;
      expect(() => requestUpdateSessionState(user2.token, quiz.quizId, session.sessionId, 'END')).toThrow(HTTPError[403]);
    });
    test('Action provided is not a valid Action enum', () => {
      expect(() => requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'BANANA')).toThrow(HTTPError[400]);
    });
    test('Action enum cannot be applied in the current state (see spec for details)', () => {
      expect(() => requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER')).toThrow(HTTPError[400]);
    });
    test('Session Id does not refer to a valid session within this quiz', () => {
      expect(() => requestUpdateSessionState(user.token, quiz.quizId, session.sessionId + 1, 'END')).toThrow(HTTPError[400]);
    });
  });
  describe('Successful cases', () => {
    // jest.useFakeTimers();
    test('Correct return value', () => {
      expect(requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'END')).toStrictEqual({});
    });
    test('Correctly updates state LOBBY --> QUESTION_COUNTDOWN', () => {
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION');
      const result = requestGetSessionStatus(user.token, quiz.quizId, session.sessionId);
      expect(result.state).toStrictEqual('QUESTION_COUNTDOWN');
    });
    test('Correctly updates state LOBBY --> QUESTION_COUNTDOWN', () => {
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, Action.NEXT_QUESTION);
      sleepSync(2 * 1000);
      let result = requestGetSessionStatus(user.token, quiz.quizId, session.sessionId);
      expect(result.state).toStrictEqual('QUESTION_COUNTDOWN');
      sleepSync(2 * 1000);
      result = requestGetSessionStatus(user.token, quiz.quizId, session.sessionId);
      expect(result.state).toStrictEqual('QUESTION_OPEN');
    });
    test('Testing timer works for every question', () => {
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION');
      sleepSync(2 * 1000);
      sleepSync(2 * 1000);

      const result = requestGetSessionStatus(user.token, quiz.quizId, session.sessionId);
      expect(result.state).toStrictEqual('QUESTION_OPEN');
    });
  });
});

// GetSessionStatus Testing
describe('request GetSessionStatus testing', () => {
  let user: SessionId;
  let quiz: quizId;
  let questionin: quizQuestionCreateInput;
  let session: QuizSession;
  beforeEach(() => {
    user = requestRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My Quiz Description');
    questionin = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Prince Charles.',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    requestQuizQuestionCreate(user.token, questionin, quiz.quizId);
    session = requestSessionStart(user.token, quiz.quizId, 3);
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid SessionId', () => {
      expect(() => requestGetSessionStatus(user.token + 1, quiz.quizId, session.sessionId)).toThrow(HTTPError[401]);
    });
    test('Invalid quizId', () => {
      expect(() => requestGetSessionStatus(user.token, quiz.quizId + 1, session.sessionId)).toThrow(HTTPError[403]);
    });
    test('user does not own quiz', () => {
      const user2 = requestRegister('ethan@gmail.com', 'password1', 'Ethan', 'McGregor').jsonBody as SessionId;
      expect(() => requestGetSessionStatus(user2.token, quiz.quizId, session.sessionId)).toThrow(HTTPError[403]);
    });
    test('Session Id does not refer to a valid session within this quiz', () => {
      expect(() => requestGetSessionStatus(user.token, quiz.quizId, session.sessionId + 1)).toThrow(HTTPError[400]);
    });
  });
  describe('Successful cases', () => {
    test('Correct return value', () => {
      // console.log(requestGetSessionStatus(user.token, quiz.quizId, session.sessionId));
      expect(requestGetSessionStatus(user.token, quiz.quizId, session.sessionId)).toStrictEqual({
        state: 'LOBBY',
        atQuestion: 0,
        players: [],
        metadata: {
          quizId: quiz.quizId,
          name: 'My Quiz',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'My Quiz Description',
          numQuestions: 1,
          questions: [
            {
              questionId: expect.any(Number),
              question: expect.any(String),
              duration: expect.any(Number),
              points: expect.any(Number),
              answers: [
                {
                  answer: expect.any(String),
                  answerId: expect.any(Number),
                  colour: expect.any(String),
                  correct: expect.any(Boolean)
                },
                {
                  answer: expect.any(String),
                  answerId: expect.any(Number),
                  colour: expect.any(String),
                  correct: expect.any(Boolean)
                }
              ]
            }
          ],
          duration: expect.any(Number),
          thumbnailUrl: expect.any(String)
        }
      });
    });
  });
});

//QuizSessionFinalResults testing
describe('request QuizSessionFinalResults testing', () => {
  let user: SessionId;
  let quiz: quizId;
  let questionin: quizQuestionCreateInput;
  let question: questionId
  let session: QuizSession;
  beforeEach(() => {
    user = requestRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My Quiz Description');
    questionin = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Prince Charles.',
          correct: false
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    question = requestQuizQuestionCreate(user.token, questionin, quiz.quizId);
    session = requestSessionStart(user.token, quiz.quizId, 3);
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid SessionId', () => {
      expect(() => requestQuizSessionFinalResults(user.token + 1, quiz.quizId, session.sessionId)).toThrow(HTTPError[401]);
    });
    test('Invalid quizId', () => {
      expect(() => requestQuizSessionFinalResults(user.token, quiz.quizId + 1, session.sessionId)).toThrow(HTTPError[403]);
    });
    test('user does not own quiz', () => {
      const user2 = requestRegister('ethan@gmail.com', 'password1', 'Ethan', 'McGregor').jsonBody as SessionId;
      expect(() => requestQuizSessionFinalResults(user2.token, quiz.quizId, session.sessionId)).toThrow(HTTPError[403]);
    });
    test('Session Id does not refer to a valid session within this quiz', () => {
      expect(() => requestQuizSessionFinalResults(user.token, quiz.quizId, session.sessionId + 1)).toThrow(HTTPError[400]);
    });
    test('Session Id does not refer to a valid session within this quiz', () => {
      expect(() => requestQuizSessionFinalResults(user.token, quiz.quizId, session.sessionId + 1)).toThrow(HTTPError[400]);
    });
    test('Quiz not in FINAL_RESULTS state', () => {
      expect(() => requestQuizSessionFinalResults(user.token, quiz.quizId, session.sessionId)).toThrow(HTTPError[400]);
    });
  });
  describe('Successful cases', () => {
    test('Correct return value', () => {
      const player = requestPlayerJoin(session.sessionId, 'chloe');
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, "NEXT_QUESTION");
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, "SKIP_COUNTDOWN");
      const response = requestPlayerQuestionInfo(player.playerId, 1);
      const answerid = [response.answers[0].answerId];
      requestPlayerAnswerSubmission(player.playerId, 1, answerid)
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, "GO_TO_ANSWER");
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, "GO_TO_FINAL_RESULTS");
      expect(requestQuizSessionFinalResults(user.token, quiz.quizId, session.sessionId)).toStrictEqual({
        "usersRankedByScore": [
          {
            "name": 'chloe',
            "score": 5
          }
        ],
        "questionResults": [
          {
            "questionId": question.questionId,
            "playersCorrectList": [
              'chloe'
            ],
            "averageAnswerTime": 0,
            "percentCorrect": 100
          }
        ]
      });
    });
  });
});

describe('requestSessionView testing', () => {
  let user: SessionId;
  let quiz: quizId;
  let questionin: quizQuestionCreateInput;
  beforeEach(() => {
    user = requestRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My Quiz Description');
    questionin = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Prince Charles.',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    requestQuizQuestionCreate(user.token, questionin, quiz.quizId);
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid Token', () => {
      expect(() => requestSessionView(user.token + 1, quiz.quizId)).toThrow(HTTPError[401]);
    });
    test('Invalid quizId', () => {
      expect(() => requestSessionView(user.token, quiz.quizId + 1)).toThrow(HTTPError[403]);
    });
  });
  describe('Successful Cases', () => {
    test('No sessions started: return empty array', () => {
      expect(requestSessionView(user.token, quiz.quizId)).toStrictEqual({ activeSessions: [], inactiveSessions: [] });
    });
    test('one active session', () => {
      const session = requestSessionStart(user.token, quiz.quizId, 3);
      expect(requestSessionView(user.token, quiz.quizId)).toStrictEqual({ activeSessions: [session.sessionId], inactiveSessions: [] });
    });
    test('multiple active sessions', () => {
      const session1 = requestSessionStart(user.token, quiz.quizId, 3);
      const session2 = requestSessionStart(user.token, quiz.quizId, 3);
      const session3 = requestSessionStart(user.token, quiz.quizId, 3);
      const quizSessions = requestSessionView(user.token, quiz.quizId);
      const expectedSessions: sessionViewReturn = {
        activeSessions: [
          session1.sessionId,
          session2.sessionId,
          session3.sessionId,
        ],
        inactiveSessions: [],
      };
      // sorting both arrays in order of unique quizId so that the order of array matches
      quizSessions.activeSessions.sort((a: number, b: number) => a - b);
      expectedSessions.activeSessions.sort((a: number, b: number) => a - b);
      expect(quizSessions).toStrictEqual(expectedSessions);
    });
    test.todo('one inactive session');
    test.todo('multiple inactive sessions');
    test.todo('both active and inactive sessions');
  });
});

/**
 * Test for sending messages in session
 */
describe('POST /v1/player/:playerid/chat, sessionSendMessage', () => {
  let message: MessageInput;
  let session: QuizSessionId;
  let player: PlayerId;
  beforeEach(() => {
    requestClear();
    const user = requestRegister('valideEmail@gmail.com', 'password1', 'Jane', 'Lawson').jsonBody as SessionId;
    const quiz = requestQuizCreate(user.token, 'My Quiz', 'My Quiz Description') as quizId;

    // Add a question in a quiz
    const input : quizQuestionCreateInput = {
      question: 'Who is the Monarch of England?',
      duration: 10,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Prince Charles.',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    requestQuizQuestionCreate(user.token, input, quiz.quizId);
    session = requestSessionStart(user.token, quiz.quizId, 3);
    player = requestPlayerJoin(session.sessionId, 'Jane.S');
    message = { messageBody: 'Hello everyone! Nice to chat.' } as MessageInput;
  });

  test('Correct return type', () => {
    expect(() => (requestSendMessage(player.playerId, message)).not.toThrow(HTTPError));
    const returnType = requestSendMessage(player.playerId, message);
    expect(returnType).toStrictEqual({ });
  });

  test('If player ID does not exist', () => {
    expect(() => requestSendMessage(player.playerId + 100, message)).toThrow(HTTPError[400]);
  });

  test('If message body is less than 1 character', () => {
    const invalidMessage = { messageBody: '' } as MessageInput;
    expect(() => requestSendMessage(player.playerId, invalidMessage)).toThrow(HTTPError[400]);
  });

  test('If message body is more than 100 characters', () => {
    const invalidMessage = { messageBody: 'A longggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg' } as MessageInput;
    expect(() => requestSendMessage(player.playerId, invalidMessage)).toThrow(HTTPError[400]);
  });

  test('Testing behavior', () => {
    requestSendMessage(player.playerId, message);
    requestSendMessage(player.playerId, message);
    requestSendMessage(player.playerId, message);
    const expectedMessageList = {
      messages: [
        {
          messageBody: 'Hello everyone! Nice to chat.',
          playerId: player.playerId,
          playerName: 'Jane.S',
          timeSent: expect.any(Number),
        },
        {
          messageBody: 'Hello everyone! Nice to chat.',
          playerId: player.playerId,
          playerName: 'Jane.S',
          timeSent: expect.any(Number),
        },
        {
          messageBody: 'Hello everyone! Nice to chat.',
          playerId: player.playerId,
          playerName: 'Jane.S',
          timeSent: expect.any(Number),
        },
      ]
    };
    expect(requestMessageList(player.playerId)).toStrictEqual(expectedMessageList);
  });
});

/**
 * Test for Listing messages in session
 */
describe('GET /v1/player/:playerid/chat, sessionMessagesList', () => {
  let player: PlayerId;
  let message: MessageInput;
  beforeEach(() => {
    requestClear();
    const user = requestRegister('valideEmail@gmail.com', 'password1', 'Jane', 'Lawson').jsonBody as SessionId;
    const quiz = requestQuizCreate(user.token, 'My Quiz', 'My Quiz Description') as quizId;
    // Add a question in a quiz
    const input : quizQuestionCreateInput = {
      question: 'Who is the Monarch of England?',
      duration: 10,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Prince Charles.',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    requestQuizQuestionCreate(user.token, input, quiz.quizId);
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    player = requestPlayerJoin(session.sessionId, 'Jane.S');
    message = { messageBody: 'Hello everyone! Nice to chat.' } as MessageInput;
  });

  test('Correct return type', () => {
    expect(() => (requestMessageList(player.playerId)).not.toThrow(HTTPError));
    const returnType = requestMessageList(player.playerId);
    expect(returnType).toStrictEqual({ messages: [] });
  });

  test('If player ID does not exist', () => {
    expect(() => requestMessageList(player.playerId + 100)).toThrow(HTTPError[400]);
  });

  test('Testing behavior', () => {
    requestSendMessage(player.playerId, message);
    requestSendMessage(player.playerId, message);
    requestSendMessage(player.playerId, message);
    const expectedMessageList = {
      messages: [
        {
          messageBody: 'Hello everyone! Nice to chat.',
          playerId: player.playerId,
          playerName: 'Jane.S',
          timeSent: expect.any(Number),
        },
        {
          messageBody: 'Hello everyone! Nice to chat.',
          playerId: player.playerId,
          playerName: 'Jane.S',
          timeSent: expect.any(Number),
        },
        {
          messageBody: 'Hello everyone! Nice to chat.',
          playerId: player.playerId,
          playerName: 'Jane.S',
          timeSent: expect.any(Number),
        },
      ]
    };
    expect(requestMessageList(player.playerId)).toStrictEqual(expectedMessageList);
  });
});

/**
 * Test for sessionGetPlayerResult CSV format
 */
describe('GET /v1/admin/quiz/{quizid}/session/{sessionid}/results/csv, sessionGetPlayerResult CSV format', () => {
  let user: SessionId;
  let quiz: quizId;
  let session: QuizSessionId;
  beforeEach(() => {
    requestClear();
    user = requestRegister('valideEmail@gmail.com', 'password1', 'Jane', 'Lawson').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My Quiz Description') as quizId;
    // Add a question in a quiz
    const input : quizQuestionCreateInput = {
      question: 'Who is the Monarch of England?',
      duration: 10,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Prince Charles.',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    requestQuizQuestionCreate(user.token, input, quiz.quizId);
    session = requestSessionStart(user.token, quiz.quizId, 3);
    requestPlayerJoin(session.sessionId, 'Jane.S');
    requestUpdateSessionState(user.token, session.sessionId, quiz.quizId, 'NEXT_QUESTION');
    requestUpdateSessionState(user.token, session.sessionId, quiz.quizId, 'SKIP_COUNTDOWN');
    requestUpdateSessionState(user.token, session.sessionId, quiz.quizId, 'GO_TO_ANSWER');
    requestUpdateSessionState(user.token, session.sessionId, quiz.quizId, 'GO_TO_FINAL_RESULTS');
  });

  test('Correct return type and not throwing error', () => {
    expect(() => (requestSessionCSVResult(user.token, quiz.quizId, session.sessionId)).not.toThrow(HTTPError));
    const returnType = requestSessionCSVResult(user.token, quiz.quizId, session.sessionId);
    expect(returnType).toStrictEqual({ url: expect.any(String) });
  });

  test('400 error, Session Id does not refer to a valid session within this quiz', () => {
    expect(() => requestSessionCSVResult(user.token, quiz.quizId, session.sessionId + 100)).toThrow(HTTPError[400]);
  });

  test('400 error, Session is not in FINAL_RESULTS state', () => {
    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'END');
    expect(() => requestSessionCSVResult(user.token, quiz.quizId, session.sessionId)).toThrow(HTTPError[400]);
  });

  test('401 error, Token is empty', () => {
    expect(() => requestSessionCSVResult('', quiz.quizId, session.sessionId)).toThrow(HTTPError[401]);
  });

  test('401 error, Token is invalid', () => {
    expect(() => requestSessionCSVResult(user.token + 100, quiz.quizId, session.sessionId)).toThrow(HTTPError[401]);
  });

  test('403 error, Valid token is provided, but user is not an owner of this quiz', () => {
    requestLogout(user.token);
    const user2 = requestRegister('validemail@gmail.com', 'asddfgecdfe3', 'Hayden', 'Smith').jsonBody;
    expect(() => requestSessionCSVResult(user2.token, quiz.quizId, session.sessionId)).toThrow(HTTPError[403]);
  });
});
