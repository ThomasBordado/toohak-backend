import { requestRegister, requestQuizList, requestQuizCreate, requestClear } from './wrapper';
import {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
} from './quiz';
import { adminAuthRegister } from './auth';
import { QuizListReturn, SessionId, quizId, quizUser } from './interfaces';

beforeEach(() => {
  requestClear();
});

describe('adminQuizList testing', () => {
  let user: SessionId;
  beforeEach(() => {
    user = requestRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid AuthUserId', () => {
      requestQuizCreate(user.sessionId, 'My Quiz', 'My description.');
      const result = requestQuizList(user.sessionId + 1);
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(401);
    });
  });
  describe('Successful Cases', () => {
    test('No quizzes owned: return empty array', () => {
      expect(requestQuizList(user.sessionId).jsonBody).toStrictEqual({ quizzes: [] });
    });
    test('One quiz owned', () => {
      const quiz = requestQuizCreate(user.sessionId, 'My Quiz', 'My description.').jsonBody as quizId;
      expect(requestQuizList(user.sessionId).jsonBody).toStrictEqual({ quizzes: [{ quizId: quiz.quizId, name: 'My Quiz' }] });
    });
    test('Multiple quizzes owned', () => {
      const quiz = requestQuizCreate(user.sessionId, 'My Quiz', 'My description.').jsonBody as quizId;
      const quiz2 = requestQuizCreate(user.sessionId, 'My Second Quiz', 'My description.').jsonBody as quizId;
      const quiz3 = requestQuizCreate(user.sessionId, 'My Third Quiz', 'My description.').jsonBody as quizId;
      const quizList = requestQuizList(user.sessionId).jsonBody as QuizListReturn;
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

describe('adminQuizCreate testing', () => {
  let user: SessionId;
  beforeEach(() => {
    user = adminAuthRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner') as SessionId;
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid AuthUserId', () => {
      expect(adminQuizCreate(user.sessionId + 1, 'My Quiz', 'My description.')).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: Contains non-alphanumeric characters', () => {
      expect(adminQuizCreate(user.sessionId, 'My Quiz!', 'My description.')).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: blank name', () => {
      expect(adminQuizCreate(user.sessionId, '', 'My description.')).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: < 3 characters', () => {
      expect(adminQuizCreate(user.sessionId, 'My', 'My description.')).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: > 30 characters', () => {
      expect(adminQuizCreate(user.sessionId, 'My very very very very long Quiz', 'My description.')).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: name already used', () => {
      adminQuizCreate(user.sessionId, 'My Quiz', 'My description');
      expect(adminQuizCreate(user.sessionId, 'My Quiz', 'My other description')).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid description: > 100 characters', () => {
      expect(adminQuizCreate(user.sessionId, 'My Quiz', 'My very, very, very, very, very, very, very, very, very, very, very, very, very, very, long description.')).toStrictEqual({ error: expect.any(String) });
    });
  });
  describe('Successful cases', () => {
    test('Create single quiz', () => {
      expect(adminQuizCreate(user.sessionId, 'My Quiz', 'My description.')).toStrictEqual({ quizId: expect.any(Number) });
    });
    test('Create two quizes w/ unique quizId', () => {
      const quiz1 = adminQuizCreate(user.sessionId, 'My Quiz', 'My description.') as quizId;
      const quiz2 = adminQuizCreate(user.sessionId, 'My Quiz2', 'My description.') as quizId;
      expect(quiz1).toStrictEqual({ quizId: expect.any(Number) });
      expect(quiz2).toStrictEqual({ quizId: expect.any(Number) });
      expect(quiz1.quizId).not.toStrictEqual(quiz2.quizId);
    });
    test('blank description', () => {
      expect(adminQuizCreate(user.sessionId, 'My Quiz', '')).toStrictEqual({ quizId: expect.any(Number) });
    });
    test('Same name used by different user', () => {
      adminQuizCreate(user.sessionId, 'My Quiz', 'My description.');
      const user2 = adminAuthRegister('hayden.smith@unsw.edu.au', 'password2', 'Hayden', 'Smith') as SessionId;
      expect(adminQuizCreate(user2.sessionId, 'My Quiz', 'My other description.')).toStrictEqual({ quizId: expect.any(Number) });
    });
  });
});

describe('adminQuizRemove testing', () => {
  let user: SessionId;
  let quiz: quizId;
  beforeEach(() => {
    user = adminAuthRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner') as SessionId;
    quiz = adminQuizCreate(user.sessionId, 'My Quiz', 'My description.') as quizId;
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid AuthUserId', () => {
      expect(adminQuizRemove(user.sessionId + 1, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid quizId', () => {
      expect(adminQuizRemove(user.sessionId, quiz.quizId + 1)).toStrictEqual({ error: expect.any(String) });
    });
    test('User does not own quiz with given quizId', () => {
      const user2 = adminAuthRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner') as SessionId;
      expect(adminQuizRemove(user2.sessionId, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
    });
    test('User owns quiz with same name as given quizId', () => {
      const user2 = adminAuthRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner') as SessionId;
      adminQuizCreate(user2.sessionId, 'My Quiz', 'My description.');
      expect(adminQuizRemove(user2.sessionId, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
    });
    test('Remove same quiz twice', () => {
      adminQuizRemove(user.sessionId, quiz.quizId);
      expect(adminQuizRemove(user.sessionId, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
    });
  });
  describe('Successful cases', () => {
    test('Remove single quiz', () => {
      expect(adminQuizRemove(user.sessionId, quiz.quizId)).toStrictEqual({});
      expect(adminQuizList(user.sessionId)).toStrictEqual({ quizzes: [] });
    });
    test('Remove multiple quizzes', () => {
      const quiz2 = adminQuizCreate(user.sessionId, 'My Second Quiz', 'My description.') as quizId;
      const quiz3 = adminQuizCreate(user.sessionId, 'My Third Quiz', 'My description.') as quizId;

      expect(adminQuizRemove(user.sessionId, quiz2.quizId)).toStrictEqual({});
      const quizList = adminQuizList(user.sessionId) as QuizListReturn;
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

      expect(adminQuizRemove(user.sessionId, quiz.quizId)).toStrictEqual({});
      expect(adminQuizList(user.sessionId)).toStrictEqual({ quizzes: [{ quizId: quiz3.quizId, name: 'My Third Quiz' }] });

      expect(adminQuizRemove(user.sessionId, quiz3.quizId)).toStrictEqual({});
      expect(adminQuizList(user.sessionId)).toStrictEqual({ quizzes: [] });
    });
  });
});

describe('adminQuizInfo testing', () => {
  let user: SessionId;
  let quiz: quizId;
  beforeEach(() => {
    user = adminAuthRegister('ethan@gmail.com', 'password1', 'Ethan', 'McGregor') as SessionId;
    quiz = adminQuizCreate(user.sessionId, 'My Quiz', 'My description.') as quizId;
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid AuthUserId', () => {
      expect(adminQuizInfo(user.sessionId + 1, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid quizId', () => {
      expect(adminQuizInfo(user.sessionId, quiz.quizId + 1)).toStrictEqual({ error: expect.any(String) });
    });
    test('User does not own quiz with given quizId', () => {
      const user2 = adminAuthRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor') as SessionId;
      expect(adminQuizInfo(user2.sessionId, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
    });
    test('User owns quiz with same name as given quizId', () => {
      const user2 = adminAuthRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor') as SessionId;
      adminQuizCreate(user2.sessionId, 'My Quiz', 'My description.');
      expect(adminQuizInfo(user2.sessionId, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
    });
  });
  describe('Successful cases', () => {
    test('Return correct object containing quiz info', () => {
      expect(adminQuizInfo(user.sessionId, quiz.quizId)).toStrictEqual({
        quizId: quiz.quizId,
        name: 'My Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'My description.',
      });
    });
  });
});

describe('adminQuizNameUpdate testing', () => {
  let user: SessionId;
  let quiz: quizId;
  beforeEach(() => {
    user = adminAuthRegister('ethan@gmail.com', 'password1', 'Ethan', 'Mcgregor') as SessionId;
    quiz = adminQuizCreate(user.sessionId, 'My Quiz', 'My description.') as quizId;
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid AuthUserId', () => {
      expect(adminQuizNameUpdate(user.sessionId + 1, quiz.quizId, 'Ethans quiz')).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid quizId', () => {
      expect(adminQuizNameUpdate(user.sessionId, quiz.quizId + 1, 'Ethans quiz')).toStrictEqual({ error: expect.any(String) });
    });
    test('User does not own quiz with given quizId', () => {
      const user2 = adminAuthRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor') as SessionId;
      expect(adminQuizNameUpdate(user2.sessionId, quiz.quizId, 'Ethans quiz')).toStrictEqual({ error: expect.any(String) });
    });
    test('User owns quiz with same name as given quizId', () => {
      const user2 = adminAuthRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor') as SessionId;
      adminQuizCreate(user2.sessionId, 'My Quiz', 'My description.');
      expect(adminQuizNameUpdate(user2.sessionId, quiz.quizId, 'Ethans quiz')).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: Contains non-alphanumeric characters', () => {
      expect(adminQuizNameUpdate(user.sessionId, quiz.quizId, 'My Quiz!')).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: blank name', () => {
      expect(adminQuizNameUpdate(user.sessionId, quiz.quizId, '')).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: < 3 characters', () => {
      expect(adminQuizNameUpdate(user.sessionId, quiz.quizId, 'My')).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: > 30 characters', () => {
      expect(adminQuizNameUpdate(user.sessionId, quiz.quizId, 'My very very very very long Quiz')).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: name already used', () => {
      adminQuizCreate(user.sessionId, 'My Quiz', 'My description');
      expect(adminQuizNameUpdate(user.sessionId, quiz.quizId, 'My Quiz')).toStrictEqual({ error: expect.any(String) });
    });
  });

  describe('Successful cases', () => {
    test('Return correct object containing quiz info', () => {
      expect(adminQuizNameUpdate(user.sessionId, quiz.quizId, 'Ethansquiz')).toStrictEqual({});
    });
    // test('names have been correctly updated', () => {
    //   let data = getData();
    //   adminQuizNameUpdate(user.authUserId, quiz.quizId, "Ethansquiz")
    //   expect(data.quizzes[0].name).toStrictEqual('banana');
    // });
    test('successfully change single name', () => {
      adminQuizNameUpdate(user.sessionId, quiz.quizId, 'Ethansquiz');
      expect(adminQuizList(user.sessionId)).toStrictEqual({ quizzes: [{ quizId: quiz.quizId, name: 'Ethansquiz' }] });
    });
    test('successfully change multiple names', () => {
      const quiz2 = adminQuizCreate(user.sessionId, 'My Second Quiz', 'My Second description.') as quizId;
      const quiz3 = adminQuizCreate(user.sessionId, 'My Third Quiz', 'My Third description.') as quizId;
      adminQuizNameUpdate(user.sessionId, quiz.quizId, 'Ethansquiz');
      adminQuizNameUpdate(user.sessionId, quiz2.quizId, 'Ethanssecondquiz');
      const quizList = adminQuizList(user.sessionId) as QuizListReturn;
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

describe('adminQuizDescriptionUpdate testing', () => {
  let user: SessionId;
  let quiz: quizId;
  beforeEach(() => {
    user = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith') as SessionId;
    quiz = adminQuizCreate(user.sessionId, 'My Quiz', 'My description.') as quizId;
  });

  // 1. Succesful quiz description update
  test('Test Succesful adminQuizDescriptionUpdate', () => {
    expect(adminQuizDescriptionUpdate(user.sessionId, quiz.quizId, 'My updated description.')).toStrictEqual({});
  });

  // 2. authUserId is not a valid user
  test('Test authUserId is not valid', () => {
    expect(adminQuizDescriptionUpdate(user.sessionId + 1, quiz.quizId, 'My updated description.')).toStrictEqual({ error: expect.any(String) });
  });

  // 3. Quiz Id does not refer to a valid quiz
  test('Test quizid does not refer to valid quiz', () => {
    expect(adminQuizDescriptionUpdate(user.sessionId, quiz.quizId + 1, 'My updated description.')).toStrictEqual({ error: expect.any(String) });
  });

  // 4. Quiz Id does not refer to a quiz this user owns
  test('Test quizid does not refer to a quiz this user owns', () => {
    const user1 = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith') as SessionId;
    const user2 = adminAuthRegister('jared@gmail.com', 'password3', 'Jared', 'Simion') as SessionId;
    const notmyquiz = adminQuizCreate(user2.sessionId, 'My Quiz2', 'My description.') as quizId;
    expect(adminQuizDescriptionUpdate(user1.sessionId, notmyquiz.quizId, 'My updated description.')).toStrictEqual({ error: expect.any(String) });
  });

  // 5. Quiz description is more than 100 characters long
  test('Test quiz description < 100 characters long', () => {
    expect(adminQuizDescriptionUpdate(user.sessionId, quiz.quizId, 'My very, very, very, very, very, very, very, very, very, very, very, very, very, very, long description.')).toStrictEqual({ error: expect.any(String) });
  });
});
