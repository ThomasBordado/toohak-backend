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

});

describe('adminQuizCreate testing', () => {

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
        expect(adminQuizInfo(user.authUserId, quiz.quizId)).toStrictEqual({
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

});

describe('adminQuizDescriptionUpdate testing', () => {

});
  
          
