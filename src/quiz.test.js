import {adminQuizList,
        adminQuizCreate,
        adminQuizRemove,
        adminQuizInfo,
        adminQuizNameUpdate,
        adminQuizDescriptionUpdate,} from './quiz.js';

import {clear} from './other.js';

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
      expectedList.quizzes.sort((a, b) => a.quizId - b.quizId);
      let quizList = adminQuizList(user.authUserId).quizzes.sort((a, b) => a.quizId - b.quizId);
      expect(quizList).toStrictEqual(expectedList);
    });
  });
});

describe('adminQuizCreate testing', () => {

});

describe('adminQuizRemove testing', () => {

});

describe('adminQuizInfo testing', () => {

});

describe('adminQuizNameUpdate testing', () => {

});

describe('adminQuizDescriptionUpdate testing', () => {

});
  
          