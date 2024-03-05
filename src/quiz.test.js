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

  let user;
  let quiz;
  beforeEach(() => {
    user = adminAuthRegister('ethan@gmail.com', 'password1', 'Ethan', 'McGregor');
    quiz = adminQuizCreate(user.authUserId, 'My Quiz', 'My description.');
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid AuthUserId', () => {
      expect(adminQuizInfo(user.authUserId + 1, quiz.quizId)).toStrictEqual({error: expect.any(String)});
    });
    test('Invalid quizId', () => {
      expect(adminQuizInfo(user.authUserId, quiz.quizId + 1)).toStrictEqual({error: expect.any(String)});
    });
    test('User does not own quiz with given quizId', () => {
      let user2 = adminAuthRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor');
      expect(adminQuizInfo(user2.authUserId, quiz.quizId)).toStrictEqual({error: expect.any(String)});
    });
    test('User owns quiz with same name as given quizId', () => {
      let user2 = adminAuthRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor');
      adminQuizCreate(user2.authUserId, 'My Quiz', 'My description.')
      expect(adminQuizInfo(user2.authUserId, quiz.quizId)).toStrictEqual({error: expect.any(String)});
    });
  });
  describe('Successful cases', () => {
    test('Return correct object containing quiz info', () => {
      expect(adminQuizInfo(user, quiz.quizId)).toStrictEqual({
        quizId: 1,
        name: 'My Quiz',
        timeCreated: 1683125870,
        timeLastEdited: 1683125871,
        description: 'My description.',
      });
    });
  });
});

describe('adminQuizNameUpdate testing', () => {

  let user;
  let quiz;
  beforeEach(() => {
    user = adminAuthRegister('ethan@gmail.com', 'password1', 'Ethan', 'Mcgregor');
    quiz = adminQuizCreate(user.authUserId, 'My Quiz', 'My description.');
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid AuthUserId', () => {
      expect(adminQuizNameUpdate(user.authUserId + 1, quiz.quizId, "Ethans quiz")).toStrictEqual({error: expect.any(String)});
    });
    test('Invalid quizId', () => {
      expect(adminQuizNameUpdate(user.authUserId, quiz.quizId + 1, "Ethans quiz")).toStrictEqual({error: expect.any(String)});
    });
    test('User does not own quiz with given quizId', () => {
      let user2 = adminAuthRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor');
      expect(adminQuizNameUpdate(user2.authUserId, quiz.quizId, "Ethans quiz")).toStrictEqual({error: expect.any(String)});
    });
    test('User owns quiz with same name as given quizId', () => {
      let user2 = adminAuthRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor');
      adminQuizCreate(user2.authUserId, 'My Quiz', 'My description.')
      expect(adminQuizNameUpdate(user2.authUserId, quiz.quizId, "Ethans quiz")).toStrictEqual({error: expect.any(String)});
    });
    test('Invalid name: Contains non-alphanumeric characters', () => {
      expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, "My Quiz!")).toStrictEqual({error: expect.any(String)});
    });
    test('Invalid name: blank name', () => {
      expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, "")).toStrictEqual({error: expect.any(String)});
    });
    test('Invalid name: < 3 characters', () => {
      expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, "My")).toStrictEqual({error: expect.any(String)});
    });
    test('Invalid name: > 30 characters', () => {
      expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, "My very very very very long Quiz")).toStrictEqual({error: expect.any(String)});
    });
    test('Invalid name: name already used', () => {
      adminQuizCreate(user.authUserId, 'My Quiz', 'My description');
      expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, 'My Quiz')).toStrictEqual({error: expect.any(String)});
    });
  });

  
  describe('Successful cases', () => {
    test('Return correct object containing quiz info', () => {
      expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, "Ethansquiz")).toStrictEqual({});
      
    });
    
  });

  describe('extra testing', () => {
    test('correct quiz id', () => {
      expect(quiz.quizId).toStrictEqual(1);
    });
  });
});


describe('adminQuizDescriptionUpdate testing', () => {

});