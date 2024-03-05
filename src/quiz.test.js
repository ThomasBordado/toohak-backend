import {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
} from './quiz.js';

import { clear } from './other.js';

import { adminAuthRegister } from './auth.js'

beforeEach(() => {
  clear();
});


describe('adminQuizList testing', () => {

});

describe('adminQuizCreate testing', () => {

  let user;
  beforeEach(() => {
    user = adminAuthRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner');
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid AuthUserId', () => {
      expect(adminQuizCreate(user.authUserId + 1, 'My Quiz', 'My description.')).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: Contains non-alphanumeric characters', () => {
      expect(adminQuizCreate(user.authUserId, 'My Quiz!', 'My description.')).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: blank name', () => {
      expect(adminQuizCreate(user.authUserId, '', 'My description.')).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: < 3 characters', () => {
      expect(adminQuizCreate(user.authUserId, 'My', 'My description.')).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: > 30 characters', () => {
      expect(adminQuizCreate(user.authUserId, 'My very very very very long Quiz', 'My description.')).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: name already used', () => {
      adminQuizCreate(user.authUserId, 'My Quiz', 'My description');
      expect(adminQuizCreate(user.authUserId, 'My Quiz', 'My other description')).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid description: > 100 characters', () => {
      expect(adminQuizCreate(user.authUserId, 'My Quiz', 'My very, very, very, very, very, very, very, very, very, very, very, very, very, very, long description.')).toStrictEqual({ error: expect.any(String) });
    });
  });
  describe('Successful cases', () => {
    test('Create single quiz', () => {
      expect(adminQuizCreate(user.authUserId, 'My Quiz', 'My description.')).toStrictEqual({ quizId: expect.any(Number) });
    });
    test('Create two quizes w/ unique quizId', () => {
      const quiz1 = adminQuizCreate(user.authUserId, 'My Quiz', 'My description.');
      const quiz2 = adminQuizCreate(user.authUserId, 'My Quiz2', 'My description.');
      expect(quiz1).toStrictEqual({ quizId: expect.any(Number) });
      expect(quiz2).toStrictEqual({ quizId: expect.any(Number) });
      expect(quiz1.quizId).not.toStrictEqual(quiz2.quizId);
    });
    test('blank description', () => {
      expect(adminQuizCreate(user.authUserId, 'My Quiz', '')).toStrictEqual({ quizId: expect.any(Number) });
    });
    test('Same name used by different user', () => {
      adminQuizCreate(user.authUserId, 'My Quiz', 'My description.');
      const user2 = adminAuthRegister('hayden.smith@unsw.edu.au', 'password2', 'Hayden', 'Smith')
      expect(adminQuizCreate(user2.authUserId, 'My Quiz', 'My other description.')).toStrictEqual({ quizId: expect.any(Number) });
    });
  });
});

describe('adminQuizRemove testing', () => {

});

describe('adminQuizInfo testing', () => {

});

describe('adminQuizNameUpdate testing', () => {

});

describe('adminQuizDescriptionUpdate testing', () => {
  let user;
  let quiz;
  beforeEach(() => {
    user = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith');
    quiz = adminQuizCreate(user.authUserId, 'My Quiz', 'My description.');
  });

  // 1. Succesful quiz description update
  test('Test Succesful adminQuizDescriptionUpdate', () => {
    expect(adminQuizDescriptionUpdate(user.authUserId, quiz.quizId, 'My updated description.')).toStrictEqual({});
  });

  // 2. authUserId is not a valid user 
  test('Test authUserId is not valid', () => {
    expect(adminQuizDescriptionUpdate(user.authUserId + 1, quiz.quizId, 'My updated description.')).toStrictEqual({ error: expect.any(String) });
  });

  // 3. Quiz Id does not refer to a valid quiz
  test('Test quizid does not refer to valid quiz', () => {
    expect(adminQuizDescriptionUpdate(user.authUserId, quiz.quizId + 1, 'My updated description.')).toStrictEqual({ error: expect.any(String) });
  });

  // 4. Quiz Id does not refer to a quiz this user owns
  test('Test quizid does not refer to a quiz this user owns', () => {
    const user1 = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith');
    const user2 = adminAuthRegister('jared@gmail.com', 'password3', 'Jared', 'Simion');
    const notmyquiz = adminQuizCreate(user2.authUserId, 'My Quiz2', 'My description.');
    expect(adminQuizDescriptionUpdate(user1.authUserId, notmyquiz.quizId, 'My updated description.')).toStrictEqual({ error: expect.any(String) });
  });

  //5. Quiz description is more than 100 characters long
  test('Test quiz description < 100 characters long', () => {
    expect(adminQuizDescriptionUpdate(user.authUserId, quiz.quizId, 'My very, very, very, very, very, very, very, very, very, very, very, very, very, very, long description.')).toStrictEqual({ error: expect.any(String) });
  });
});