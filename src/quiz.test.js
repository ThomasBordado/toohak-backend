import {adminQuizList,
        adminQuizCreate,
        adminQuizRemove,
        adminQuizInfo,
        adminQuizNameUpdate,
        adminQuizDescriptionUpdate,} from './quiz.js';

import {clear} from './other.js';

import {adminAuthRegister} from './auth.js'

beforeEach(() => {
  clear();
});


describe('adminQuizList testing', () => {
  let user;
  beforeEach(() => {
    user = adminAuthRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner');
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid AuthUserId', () => {
      adminQuizCreate(user.authUserId, 'My Quiz', 'My description.');
      expect(adminQuizList(user.authUserId + 1)).toStrictEqual({error: expect.any(String)});
    });
  });
  describe('Successful Cases', () => {
    test('No quizzes owned: return empty array', () => {
      expect(adminQuizList(user.authUserId)).toStrictEqual({quizzes: []});
    });
    test('One quiz owned', () => {
      let quiz = adminQuizCreate(user.authUserId, 'My Quiz', 'My description.');
      expect(adminQuizList(user.authUserId)).toStrictEqual({quizzes: [{quizId: quiz.quizId, name: 'My Quiz'}]});
    });
    test('Multiple quizzes owned', () => {
      let quiz = adminQuizCreate(user.authUserId, 'My Quiz', 'My description.');
      let quiz2 = adminQuizCreate(user.authUserId, 'My Second Quiz', 'My description.');
      let quiz3 = adminQuizCreate(user.authUserId, 'My Third Quiz', 'My description.');
      let quizList = adminQuizList(user.authUserId);
      let expectedList = {
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
      //sorting both arrays in order of unique quizId so that the order of array matches
      quizList.quizzes.sort((a, b) => a.quizId - b.quizId);
      expectedList.quizzes.sort((a, b) => a.quizId - b.quizId);
      expect(quizList).toStrictEqual(expectedList);
    });
  });
});

describe('adminQuizCreate testing', () => {

  let user;
  beforeEach(() => {
    user = adminAuthRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner');
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid AuthUserId', () => {
      expect(adminQuizCreate(user.authUserId + 1, 'My Quiz', 'My description.')).toStrictEqual({error: expect.any(String)});
    });
    test('Invalid name: Contains non-alphanumeric characters', () => {
      expect(adminQuizCreate(user.authUserId, 'My Quiz!', 'My description.')).toStrictEqual({error: expect.any(String)});
    });
    test('Invalid name: blank name', () => {
      expect(adminQuizCreate(user.authUserId, '', 'My description.')).toStrictEqual({error: expect.any(String)});
    });
    test('Invalid name: < 3 characters', () => {
      expect(adminQuizCreate(user.authUserId, 'My', 'My description.')).toStrictEqual({error: expect.any(String)});
    });
    test('Invalid name: > 30 characters', () => {
      expect(adminQuizCreate(user.authUserId, 'My very very very very long Quiz', 'My description.')).toStrictEqual({error: expect.any(String)});
    });
    test('Invalid name: name already used', () => {
      adminQuizCreate(user.authUserId, 'My Quiz', 'My description');
      expect(adminQuizCreate(user.authUserId, 'My Quiz', 'My other description')).toStrictEqual({error: expect.any(String)});
    });
    test('Invalid description: > 100 characters', () => {
      expect(adminQuizCreate(user.authUserId, 'My Quiz', 'My very, very, very, very, very, very, very, very, very, very, very, very, very, very, long description.')).toStrictEqual({error: expect.any(String)});
    });
  });
  describe('Successful cases', () => {
    test('Create single quiz', () => {
      expect(adminQuizCreate(user.authUserId, 'My Quiz', 'My description.')).toStrictEqual({quizId: expect.any(Number)});
    });
    test('Create two quizes w/ unique quizId', () => {
      const quiz1 = adminQuizCreate(user.authUserId, 'My Quiz', 'My description.');
      const quiz2 = adminQuizCreate(user.authUserId, 'My Quiz2', 'My description.');
      expect(quiz1).toStrictEqual({quizId: expect.any(Number)});
      expect(quiz2).toStrictEqual({quizId: expect.any(Number)});
      expect(quiz1.quizId).not.toStrictEqual(quiz2.quizId);
    });
    test('blank description', () => {
      expect(adminQuizCreate(user.authUserId, 'My Quiz', '')).toStrictEqual({quizId: expect.any(Number)});
    });
    test('Same name used by different user', () => {
      adminQuizCreate(user.authUserId, 'My Quiz', 'My description.');
      const user2 = adminAuthRegister('hayden.smith@unsw.edu.au', 'password2', 'Hayden', 'Smith')
      expect(adminQuizCreate(user2.authUserId, 'My Quiz', 'My other description.')).toStrictEqual({quizId: expect.any(Number)});
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

});
  
          