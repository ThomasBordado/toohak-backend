import { QuizListReturn, SessionId, quizId, quizUser } from './interfaces';
import { requestQuizCreate, requestRegister, requestClear } from './wrapper';

beforeEach(() => {
  requestClear();
});

// describe('adminQuizList testing', () => {
//   let user: UserId;
//   beforeEach(() => {
//     user = adminAuthRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner') as UserId;
//   });

//   describe('Unsuccessful Cases', () => {
//     test('Invalid AuthUserId', () => {
//       adminQuizCreate(user.authUserId, 'My Quiz', 'My description.');
//       expect(adminQuizList(user.authUserId + 1)).toStrictEqual({ error: expect.any(String) });
//     });
//   });
//   describe('Successful Cases', () => {
//     test('No quizzes owned: return empty array', () => {
//       expect(adminQuizList(user.authUserId)).toStrictEqual({ quizzes: [] });
//     });
//     test('One quiz owned', () => {
//       const quiz = adminQuizCreate(user.authUserId, 'My Quiz', 'My description.') as quizId;
//       expect(adminQuizList(user.authUserId)).toStrictEqual({ quizzes: [{ quizId: quiz.quizId, name: 'My Quiz' }] });
//     });
//     test('Multiple quizzes owned', () => {
//       const quiz = adminQuizCreate(user.authUserId, 'My Quiz', 'My description.') as quizId;
//       const quiz2 = adminQuizCreate(user.authUserId, 'My Second Quiz', 'My description.') as quizId;
//       const quiz3 = adminQuizCreate(user.authUserId, 'My Third Quiz', 'My description.') as quizId;
//       const quizList = adminQuizList(user.authUserId) as QuizListReturn;
//       const expectedList = {
//         quizzes: [
//           {
//             quizId: quiz.quizId,
//             name: 'My Quiz',
//           },
//           {
//             quizId: quiz2.quizId,
//             name: 'My Second Quiz',
//           },
//           {
//             quizId: quiz3.quizId,
//             name: 'My Third Quiz',
//           }
//         ]
//       };
//       // sorting both arrays in order of unique quizId so that the order of array matches
//       quizList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
//       expectedList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
//       expect(quizList).toStrictEqual(expectedList);
//     });
//   });
// });

describe('adminQuizCreate testing', () => {
  let user: SessionId;
  beforeEach(() => {
    user = requestRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid AuthUserId', () => {
      expect(requestQuizCreate(user.sessionId + 1, 'My Quiz', 'My description.').jsonBody).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: Contains non-alphanumeric characters', () => {
      expect(requestQuizCreate(user.sessionId, 'My Quiz!', 'My description.').jsonBody).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: blank name', () => {
      expect(requestQuizCreate(user.sessionId, '', 'My description.').jsonBody).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: < 3 characters', () => {
      expect(requestQuizCreate(user.sessionId, 'My', 'My description.').jsonBody).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: > 30 characters', () => {
      expect(requestQuizCreate(user.sessionId, 'My very very very very long Quiz', 'My description.').jsonBody).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid name: name already used', () => {
      requestQuizCreate(user.sessionId, 'My Quiz', 'My description');
      expect(requestQuizCreate(user.sessionId, 'My Quiz', 'My other description').jsonBody).toStrictEqual({ error: expect.any(String) });
    });
    test('Invalid description: > 100 characters', () => {
      expect(requestQuizCreate(user.sessionId, 'My Quiz', 'My very, very, very, very, very, very, very, very, very, very, very, very, very, very, long description.').jsonBody).toStrictEqual({ error: expect.any(String) });
    });
  });
  describe('Successful cases', () => {
    test('Create single quiz', () => {
      console.log(user);
      expect(requestQuizCreate(user.sessionId, 'My Quiz', 'My description.').jsonBody).toStrictEqual({ quizId: expect.any(Number) });
    });
    test('Create two quizes w/ unique quizId', () => {
      const quiz1 = requestQuizCreate(user.sessionId, 'My Quiz', 'My description.').jsonBody as quizId;
      const quiz2 = requestQuizCreate(user.sessionId, 'My Quiz2', 'My description.').jsonBody as quizId;
      expect(quiz1).toStrictEqual({ quizId: expect.any(Number) });
      expect(quiz2).toStrictEqual({ quizId: expect.any(Number) });
      expect(quiz1.quizId).not.toStrictEqual(quiz2.quizId);
    });
    test('blank description', () => {
      expect(requestQuizCreate(user.sessionId, 'My Quiz', '').jsonBody).toStrictEqual({ quizId: expect.any(Number) });
    });
    test('Same name used by different user', () => {
      requestQuizCreate(user.sessionId, 'My Quiz', 'My description.');
      const user2 = requestRegister('hayden.smith@unsw.edu.au', 'password2', 'Hayden', 'Smith').jsonBody as SessionId;
      expect(requestQuizCreate(user2.sessionId, 'My Quiz', 'My other description.').jsonBody).toStrictEqual({ quizId: expect.any(Number) });
    });
  });
});

// describe('adminQuizRemove testing', () => {
//   let user: UserId;
//   let quiz: quizId;
//   beforeEach(() => {
//     user = adminAuthRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner') as UserId;
//     quiz = adminQuizCreate(user.authUserId, 'My Quiz', 'My description.') as quizId;
//   });

//   describe('Unsuccessful Cases', () => {
//     test('Invalid AuthUserId', () => {
//       expect(adminQuizRemove(user.authUserId + 1, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
//     });
//     test('Invalid quizId', () => {
//       expect(adminQuizRemove(user.authUserId, quiz.quizId + 1)).toStrictEqual({ error: expect.any(String) });
//     });
//     test('User does not own quiz with given quizId', () => {
//       const user2 = adminAuthRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner') as UserId;
//       expect(adminQuizRemove(user2.authUserId, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
//     });
//     test('User owns quiz with same name as given quizId', () => {
//       const user2 = adminAuthRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner') as UserId;
//       adminQuizCreate(user2.authUserId, 'My Quiz', 'My description.');
//       expect(adminQuizRemove(user2.authUserId, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
//     });
//     test('Remove same quiz twice', () => {
//       adminQuizRemove(user.authUserId, quiz.quizId);
//       expect(adminQuizRemove(user.authUserId, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
//     });
//   });
//   describe('Successful cases', () => {
//     test('Remove single quiz', () => {
//       expect(adminQuizRemove(user.authUserId, quiz.quizId)).toStrictEqual({});
//       expect(adminQuizList(user.authUserId)).toStrictEqual({ quizzes: [] });
//     });
//     test('Remove multiple quizzes', () => {
//       const quiz2 = adminQuizCreate(user.authUserId, 'My Second Quiz', 'My description.') as quizId;
//       const quiz3 = adminQuizCreate(user.authUserId, 'My Third Quiz', 'My description.') as quizId;

//       expect(adminQuizRemove(user.authUserId, quiz2.quizId)).toStrictEqual({});
//       const quizList = adminQuizList(user.authUserId) as QuizListReturn;
//       const expectedList = {
//         quizzes: [
//           {
//             quizId: quiz.quizId,
//             name: 'My Quiz',
//           },
//           {
//             quizId: quiz3.quizId,
//             name: 'My Third Quiz',
//           },
//         ]
//       };
//       quizList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
//       expectedList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
//       expect(quizList).toStrictEqual(expectedList);

//       expect(adminQuizRemove(user.authUserId, quiz.quizId)).toStrictEqual({});
//       expect(adminQuizList(user.authUserId)).toStrictEqual({ quizzes: [{ quizId: quiz3.quizId, name: 'My Third Quiz' }] });

//       expect(adminQuizRemove(user.authUserId, quiz3.quizId)).toStrictEqual({});
//       expect(adminQuizList(user.authUserId)).toStrictEqual({ quizzes: [] });
//     });
//   });
// });

// describe('adminQuizInfo testing', () => {
//   let user: UserId;
//   let quiz: quizId;
//   beforeEach(() => {
//     user = adminAuthRegister('ethan@gmail.com', 'password1', 'Ethan', 'McGregor') as UserId;
//     quiz = adminQuizCreate(user.authUserId, 'My Quiz', 'My description.') as quizId;
//   });

//   describe('Unsuccessful Cases', () => {
//     test('Invalid AuthUserId', () => {
//       expect(adminQuizInfo(user.authUserId + 1, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
//     });
//     test('Invalid quizId', () => {
//       expect(adminQuizInfo(user.authUserId, quiz.quizId + 1)).toStrictEqual({ error: expect.any(String) });
//     });
//     test('User does not own quiz with given quizId', () => {
//       const user2 = adminAuthRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor') as UserId;
//       expect(adminQuizInfo(user2.authUserId, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
//     });
//     test('User owns quiz with same name as given quizId', () => {
//       const user2 = adminAuthRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor') as UserId;
//       adminQuizCreate(user2.authUserId, 'My Quiz', 'My description.');
//       expect(adminQuizInfo(user2.authUserId, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
//     });
//   });
//   describe('Successful cases', () => {
//     test('Return correct object containing quiz info', () => {
//       expect(adminQuizInfo(user.authUserId, quiz.quizId)).toStrictEqual({
//         quizId: quiz.quizId,
//         name: 'My Quiz',
//         timeCreated: expect.any(Number),
//         timeLastEdited: expect.any(Number),
//         description: 'My description.',
//       });
//     });
//   });
// });

// describe('adminQuizNameUpdate testing', () => {
//   let user: UserId;
//   let quiz: quizId;
//   beforeEach(() => {
//     user = adminAuthRegister('ethan@gmail.com', 'password1', 'Ethan', 'Mcgregor') as UserId;
//     quiz = adminQuizCreate(user.authUserId, 'My Quiz', 'My description.') as quizId;
//   });

//   describe('Unsuccessful Cases', () => {
//     test('Invalid AuthUserId', () => {
//       expect(adminQuizNameUpdate(user.authUserId + 1, quiz.quizId, 'Ethans quiz')).toStrictEqual({ error: expect.any(String) });
//     });
//     test('Invalid quizId', () => {
//       expect(adminQuizNameUpdate(user.authUserId, quiz.quizId + 1, 'Ethans quiz')).toStrictEqual({ error: expect.any(String) });
//     });
//     test('User does not own quiz with given quizId', () => {
//       const user2 = adminAuthRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor') as UserId;
//       expect(adminQuizNameUpdate(user2.authUserId, quiz.quizId, 'Ethans quiz')).toStrictEqual({ error: expect.any(String) });
//     });
//     test('User owns quiz with same name as given quizId', () => {
//       const user2 = adminAuthRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor') as UserId;
//       adminQuizCreate(user2.authUserId, 'My Quiz', 'My description.');
//       expect(adminQuizNameUpdate(user2.authUserId, quiz.quizId, 'Ethans quiz')).toStrictEqual({ error: expect.any(String) });
//     });
//     test('Invalid name: Contains non-alphanumeric characters', () => {
//       expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, 'My Quiz!')).toStrictEqual({ error: expect.any(String) });
//     });
//     test('Invalid name: blank name', () => {
//       expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, '')).toStrictEqual({ error: expect.any(String) });
//     });
//     test('Invalid name: < 3 characters', () => {
//       expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, 'My')).toStrictEqual({ error: expect.any(String) });
//     });
//     test('Invalid name: > 30 characters', () => {
//       expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, 'My very very very very long Quiz')).toStrictEqual({ error: expect.any(String) });
//     });
//     test('Invalid name: name already used', () => {
//       adminQuizCreate(user.authUserId, 'My Quiz', 'My description');
//       expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, 'My Quiz')).toStrictEqual({ error: expect.any(String) });
//     });
//   });

//   describe('Successful cases', () => {
//     test('Return correct object containing quiz info', () => {
//       expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, 'Ethansquiz')).toStrictEqual({});
//     });
//     // test('names have been correctly updated', () => {
//     //   let data = getData();
//     //   adminQuizNameUpdate(user.authUserId, quiz.quizId, "Ethansquiz")
//     //   expect(data.quizzes[0].name).toStrictEqual('banana');
//     // });
//     test('successfully change single name', () => {
//       adminQuizNameUpdate(user.authUserId, quiz.quizId, 'Ethansquiz');
//       expect(adminQuizList(user.authUserId)).toStrictEqual({ quizzes: [{ quizId: quiz.quizId, name: 'Ethansquiz' }] });
//     });
//     test('successfully change multiple names', () => {
//       const quiz2 = adminQuizCreate(user.authUserId, 'My Second Quiz', 'My Second description.') as quizId;
//       const quiz3 = adminQuizCreate(user.authUserId, 'My Third Quiz', 'My Third description.') as quizId;
//       adminQuizNameUpdate(user.authUserId, quiz.quizId, 'Ethansquiz');
//       adminQuizNameUpdate(user.authUserId, quiz2.quizId, 'Ethanssecondquiz');
//       const quizList = adminQuizList(user.authUserId) as QuizListReturn;
//       const expectedList = {
//         quizzes: [
//           {
//             quizId: quiz.quizId,
//             name: 'Ethansquiz',
//           },
//           {
//             quizId: quiz2.quizId,
//             name: 'Ethanssecondquiz',
//           },
//           {
//             quizId: quiz3.quizId,
//             name: 'My Third Quiz',
//           }
//         ]

//       };
//       quizList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
//       expectedList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
//       expect(quizList).toStrictEqual(expectedList);
//     });
//   });
// });

// describe('adminQuizDescriptionUpdate testing', () => {
//   let user: UserId;
//   let quiz: quizId;
//   beforeEach(() => {
//     user = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith') as UserId;
//     quiz = adminQuizCreate(user.authUserId, 'My Quiz', 'My description.') as quizId;
//   });

//   // 1. Succesful quiz description update
//   test('Test Succesful adminQuizDescriptionUpdate', () => {
//     expect(adminQuizDescriptionUpdate(user.authUserId, quiz.quizId, 'My updated description.')).toStrictEqual({});
//   });

//   // 2. authUserId is not a valid user
//   test('Test authUserId is not valid', () => {
//     expect(adminQuizDescriptionUpdate(user.authUserId + 1, quiz.quizId, 'My updated description.')).toStrictEqual({ error: expect.any(String) });
//   });

//   // 3. Quiz Id does not refer to a valid quiz
//   test('Test quizid does not refer to valid quiz', () => {
//     expect(adminQuizDescriptionUpdate(user.authUserId, quiz.quizId + 1, 'My updated description.')).toStrictEqual({ error: expect.any(String) });
//   });

//   // 4. Quiz Id does not refer to a quiz this user owns
//   test('Test quizid does not refer to a quiz this user owns', () => {
//     const user1 = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith') as UserId;
//     const user2 = adminAuthRegister('jared@gmail.com', 'password3', 'Jared', 'Simion') as UserId;
//     const notmyquiz = adminQuizCreate(user2.authUserId, 'My Quiz2', 'My description.') as quizId;
//     expect(adminQuizDescriptionUpdate(user1.authUserId, notmyquiz.quizId, 'My updated description.')).toStrictEqual({ error: expect.any(String) });
//   });

//   // 5. Quiz description is more than 100 characters long
//   test('Test quiz description < 100 characters long', () => {
//     expect(adminQuizDescriptionUpdate(user.authUserId, quiz.quizId, 'My very, very, very, very, very, very, very, very, very, very, very, very, very, very, long description.')).toStrictEqual({ error: expect.any(String) });
//   });
// });
