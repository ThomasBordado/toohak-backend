import { requestRegister, requestQuizList, requestQuizCreate, requestQuizTrash, requestQuizQuestionCreat, requestClear } from './wrapper';
import { QuizListReturn, SessionId, quiz, quizId, quizUser } from './interfaces';

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
      requestQuizCreate(user.token, 'My Quiz', 'My description.');
      const result = requestQuizList(user.token + 1);
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(401);
    });
  });
  describe('Successful Cases', () => {
    test('No quizzes owned: return empty array', () => {
      expect(requestQuizList(user.token).jsonBody).toStrictEqual({ quizzes: [] });
    });
    test('One quiz owned', () => {
      const quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.').jsonBody as quizId;
      expect(requestQuizList(user.token).jsonBody).toStrictEqual({ quizzes: [{ quizId: quiz.quizId, name: 'My Quiz' }] });
    });
    test('Multiple quizzes owned', () => {
      const quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.').jsonBody as quizId;
      const quiz2 = requestQuizCreate(user.token, 'My Second Quiz', 'My description.').jsonBody as quizId;
      const quiz3 = requestQuizCreate(user.token, 'My Third Quiz', 'My description.').jsonBody as quizId;
      const quizList = requestQuizList(user.token).jsonBody as QuizListReturn;
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
    user = requestRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid SessionId', () => {
      const result = requestQuizCreate(user.token + 1, 'My Quiz', 'My description.');
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      console.log(result.jsonBody);
      expect(result.statusCode).toStrictEqual(401);
    });
    test('Invalid name: Contains non-alphanumeric characters', () => {
      const result = requestQuizCreate(user.token, 'My Quiz!', 'My description.');
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(400);
    });
    test('Invalid name: blank name', () => {
      const result = requestQuizCreate(user.token, '', 'My description.');
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(400);
    });
    test('Invalid name: < 3 characters', () => {
      const result = requestQuizCreate(user.token, 'My', 'My description.');
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(400);
    });
    test('Invalid name: > 30 characters', () => {
      const result = requestQuizCreate(user.token, 'My very very very very long Quiz', 'My description.');
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(400);
    });
    test('Invalid name: name already used', () => {
      requestQuizCreate(user.token, 'My Quiz', 'My description');
      const result = requestQuizCreate(user.token, 'My Quiz', 'My description.');
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(400);
    });
    test('Invalid description: > 100 characters', () => {
      const result = requestQuizCreate(user.token, 'My Quiz', 'My very, very, very, very, very, very, very, very, very, very, very, very, very, very, long description.');
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(400);
    });
  });
  describe('Successful cases', () => {
    test('Create single quiz', () => {
      expect(requestQuizCreate(user.token, 'My Quiz', 'My description.').jsonBody).toStrictEqual({ quizId: expect.any(Number) });
    });
    test('Create two quizes w/ unique quizId', () => {
      const quiz1 = requestQuizCreate(user.token, 'My Quiz', 'My description.').jsonBody as quizId;
      const quiz2 = requestQuizCreate(user.token, 'My Quiz2', 'My description.').jsonBody as quizId;
      expect(quiz1).toStrictEqual({ quizId: expect.any(Number) });
      expect(quiz2).toStrictEqual({ quizId: expect.any(Number) });
      expect(quiz1.quizId).not.toStrictEqual(quiz2.quizId);
    });
    test('blank description', () => {
      expect(requestQuizCreate(user.token, 'My Quiz', '').jsonBody).toStrictEqual({ quizId: expect.any(Number) });
    });
    test('Same name used by different user', () => {
      requestQuizCreate(user.token, 'My Quiz', 'My description.');
      const user2 = requestRegister('hayden.smith@unsw.edu.au', 'password2', 'Hayden', 'Smith').jsonBody as SessionId;
      expect(requestQuizCreate(user2.token, 'My Quiz', 'My other description.').jsonBody).toStrictEqual({ quizId: expect.any(Number) });
    });
  });
});

describe('adminQuizRemove testing', () => {
  let user: SessionId;
  let quiz: quizId;
  beforeEach(() => {
    user = requestRegister('chloe@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.').jsonBody as quizId;
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid AuthUserId', () => {
      const result = requestQuizTrash(user.token + 1, quiz.quizId);
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(401);
    });
    test('Invalid quizId', () => {
      const result = requestQuizTrash(user.token, quiz.quizId + 1);
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(403);
    });
    test('User does not own quiz with given quizId', () => {
      const user2 = requestRegister('chloet@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
      console.log(user2);
      const result = requestQuizTrash(user2.token, quiz.quizId);
      console.log(result.jsonBody);
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(403);
    });
    test('User owns quiz with same name as given quizId', () => {
      const user2 = requestRegister('chloet@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
      console.log(user2);
      const quz2 = requestQuizCreate(user2.token, 'My Quiz', 'My description.');
      console.log(quz2.jsonBody);
      const result = requestQuizTrash(user2.token, quiz.quizId);
      console.log(result.jsonBody);
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(403);
    });
    test('Remove same quiz twice', () => {
      requestQuizTrash(user.token, quiz.quizId);
      const result = requestQuizTrash(user.token, quiz.quizId);
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(403);
    });
  });
  describe('Successful cases', () => {
    test('Remove single quiz', () => {
      expect(requestQuizTrash(user.token, quiz.quizId).jsonBody).toStrictEqual({});
      expect(requestQuizList(user.token).jsonBody).toStrictEqual({ quizzes: [] });
    });
    test('Remove multiple quizzes', () => {
      const quiz2 = requestQuizCreate(user.token, 'My Second Quiz', 'My description.').jsonBody as quizId;
      const quiz3 = requestQuizCreate(user.token, 'My Third Quiz', 'My description.').jsonBody as quizId;

      expect(requestQuizTrash(user.token, quiz2.quizId).jsonBody).toStrictEqual({});
      const quizList = requestQuizList(user.token).jsonBody as QuizListReturn;
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

      expect(requestQuizTrash(user.token, quiz.quizId).jsonBody).toStrictEqual({});
      expect(requestQuizList(user.token).jsonBody).toStrictEqual({ quizzes: [{ quizId: quiz3.quizId, name: 'My Third Quiz' }] });

      expect(requestQuizTrash(user.token, quiz3.quizId).jsonBody).toStrictEqual({});
      expect(requestQuizList(user.token).jsonBody).toStrictEqual({ quizzes: [] });
    });
  });
});

// describe('adminQuizInfo testing', () => {
//   let user: SessionId;
//   let quiz: quizId;
//   beforeEach(() => {
//     user = adminAuthRegister('ethan@gmail.com', 'password1', 'Ethan', 'McGregor') as SessionId;
//     quiz = adminQuizCreate(user.sessionId, 'My Quiz', 'My description.') as quizId;
//   });

//   describe('Unsuccessful Cases', () => {
//     test('Invalid AuthUserId', () => {
//       expect(adminQuizInfo(user.sessionId + 1, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
//     });
//     test('Invalid quizId', () => {
//       expect(adminQuizInfo(user.sessionId, quiz.quizId + 1)).toStrictEqual({ error: expect.any(String) });
//     });
//     test('User does not own quiz with given quizId', () => {
//       const user2 = adminAuthRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor') as SessionId;
//       expect(adminQuizInfo(user2.sessionId, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
//     });
//     test('User owns quiz with same name as given quizId', () => {
//       const user2 = adminAuthRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor') as SessionId;
//       adminQuizCreate(user2.sessionId, 'My Quiz', 'My description.');
//       expect(adminQuizInfo(user2.sessionId, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
//     });
//   });
//   describe('Successful cases', () => {
//     test('Return correct object containing quiz info', () => {
//       expect(adminQuizInfo(user.sessionId, quiz.quizId)).toStrictEqual({
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
//   let user: SessionId;
//   let quiz: quizId;
//   beforeEach(() => {
//     user = adminAuthRegister('ethan@gmail.com', 'password1', 'Ethan', 'Mcgregor') as SessionId;
//     quiz = adminQuizCreate(user.sessionId, 'My Quiz', 'My description.') as quizId;
//   });

//   describe('Unsuccessful Cases', () => {
//     test('Invalid AuthUserId', () => {
//       expect(adminQuizNameUpdate(user.sessionId + 1, quiz.quizId, 'Ethans quiz')).toStrictEqual({ error: expect.any(String) });
//     });
//     test('Invalid quizId', () => {
//       expect(adminQuizNameUpdate(user.sessionId, quiz.quizId + 1, 'Ethans quiz')).toStrictEqual({ error: expect.any(String) });
//     });
//     test('User does not own quiz with given quizId', () => {
//       const user2 = adminAuthRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor') as SessionId;
//       expect(adminQuizNameUpdate(user2.sessionId, quiz.quizId, 'Ethans quiz')).toStrictEqual({ error: expect.any(String) });
//     });
//     test('User owns quiz with same name as given quizId', () => {
//       const user2 = adminAuthRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor') as SessionId;
//       adminQuizCreate(user2.sessionId, 'My Quiz', 'My description.');
//       expect(adminQuizNameUpdate(user2.sessionId, quiz.quizId, 'Ethans quiz')).toStrictEqual({ error: expect.any(String) });
//     });
//     test('Invalid name: Contains non-alphanumeric characters', () => {
//       expect(adminQuizNameUpdate(user.sessionId, quiz.quizId, 'My Quiz!')).toStrictEqual({ error: expect.any(String) });
//     });
//     test('Invalid name: blank name', () => {
//       expect(adminQuizNameUpdate(user.sessionId, quiz.quizId, '')).toStrictEqual({ error: expect.any(String) });
//     });
//     test('Invalid name: < 3 characters', () => {
//       expect(adminQuizNameUpdate(user.sessionId, quiz.quizId, 'My')).toStrictEqual({ error: expect.any(String) });
//     });
//     test('Invalid name: > 30 characters', () => {
//       expect(adminQuizNameUpdate(user.sessionId, quiz.quizId, 'My very very very very long Quiz')).toStrictEqual({ error: expect.any(String) });
//     });
//     test('Invalid name: name already used', () => {
//       adminQuizCreate(user.sessionId, 'My Quiz', 'My description');
//       expect(adminQuizNameUpdate(user.sessionId, quiz.quizId, 'My Quiz')).toStrictEqual({ error: expect.any(String) });
//     });
//   });

//   describe('Successful cases', () => {
//     test('Return correct object containing quiz info', () => {
//       expect(adminQuizNameUpdate(user.sessionId, quiz.quizId, 'Ethansquiz')).toStrictEqual({});
//     });
//     // test('names have been correctly updated', () => {
//     //   let data = getData();
//     //   adminQuizNameUpdate(user.authUserId, quiz.quizId, "Ethansquiz")
//     //   expect(data.quizzes[0].name).toStrictEqual('banana');
//     // });
//     test('successfully change single name', () => {
//       adminQuizNameUpdate(user.sessionId, quiz.quizId, 'Ethansquiz');
//       expect(adminQuizList(user.sessionId)).toStrictEqual({ quizzes: [{ quizId: quiz.quizId, name: 'Ethansquiz' }] });
//     });
//     test('successfully change multiple names', () => {
//       const quiz2 = adminQuizCreate(user.sessionId, 'My Second Quiz', 'My Second description.') as quizId;
//       const quiz3 = adminQuizCreate(user.sessionId, 'My Third Quiz', 'My Third description.') as quizId;
//       adminQuizNameUpdate(user.sessionId, quiz.quizId, 'Ethansquiz');
//       adminQuizNameUpdate(user.sessionId, quiz2.quizId, 'Ethanssecondquiz');
//       const quizList = adminQuizList(user.sessionId) as QuizListReturn;
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
//   let user: SessionId;
//   let quiz: quizId;
//   beforeEach(() => {
//     user = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith') as SessionId;
//     quiz = adminQuizCreate(user.sessionId, 'My Quiz', 'My description.') as quizId;
//   });

//   // 1. Succesful quiz description update
//   test('Test Succesful adminQuizDescriptionUpdate', () => {
//     expect(adminQuizDescriptionUpdate(user.sessionId, quiz.quizId, 'My updated description.')).toStrictEqual({});
//   });

//   // 2. authUserId is not a valid user
//   test('Test authUserId is not valid', () => {
//     expect(adminQuizDescriptionUpdate(user.sessionId + 1, quiz.quizId, 'My updated description.')).toStrictEqual({ error: expect.any(String) });
//   });

//   // 3. Quiz Id does not refer to a valid quiz
//   test('Test quizid does not refer to valid quiz', () => {
//     expect(adminQuizDescriptionUpdate(user.sessionId, quiz.quizId + 1, 'My updated description.')).toStrictEqual({ error: expect.any(String) });
//   });

//   // 4. Quiz Id does not refer to a quiz this user owns
//   test('Test quizid does not refer to a quiz this user owns', () => {
//     const user1 = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith') as SessionId;
//     const user2 = adminAuthRegister('jared@gmail.com', 'password3', 'Jared', 'Simion') as SessionId;
//     const notmyquiz = adminQuizCreate(user2.sessionId, 'My Quiz2', 'My description.') as quizId;
//     expect(adminQuizDescriptionUpdate(user1.sessionId, notmyquiz.quizId, 'My updated description.')).toStrictEqual({ error: expect.any(String) });
//   });
// 4. Quiz Id does not refer to a quiz this user owns
//test('Test quizid does not refer to a quiz this user owns', () => {
//  const user1 = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith') as UserId;
//  const user2 = adminAuthRegister('jared@gmail.com', 'password3', 'Jared', 'Simion') as UserId;
//  const notmyquiz = adminQuizCreate(user2.authUserId, 'My Quiz2', 'My description.') as quizId;
//  expect(adminQuizDescriptionUpdate(user1.authUserId, notmyquiz.quizId, 'My updated description.')).toStrictEqual({ error: expect.any(String) });
//});
//
//   // 5. Quiz description is more than 100 characters long
//   test('Test quiz description < 100 characters long', () => {
//     expect(adminQuizDescriptionUpdate(user.sessionId, quiz.quizId, 'My very, very, very, very, very, very, very, very, very, very, very, very, very, very, long description.')).toStrictEqual({ error: expect.any(String) });
//   });
// });

describe('Testing Post /v1/admin/quiz/{quizid}/question', () => {
	test('Correct status code and return value', () => {
  	let user: SessionId;
    let quiz: quizId;
    
    user = requestRegister('valideEmail@gmail.com', 'password1', 'Jane', 'Lawson').jsonBody as SessionId

    quiz = requestQuizCreate(user.token, 'British', 'history').jsonBody as quizId;

    const quizQuestionCreatResponse = requestQuizQuestionCreat(user.token,
      {
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
        ]
      },
      quiz.quizId
    );
      expect(quizQuestionCreatResponse.statusCode).toStrictEqual(200);
      expect(quizQuestionCreatResponse.jsonBody).toStrictEqual({ questionId: expect.any(Number) });
    });
  
    test('Error test for 400 error', () => {
      let user: SessionId;
      let quiz: quizId;
      
      user = requestRegister('valideEmail@gmail.com', 'password1', 'Jane', 'Lawson').jsonBody as SessionId;
      quiz = requestQuizCreate(user.token, 'British', 'history').jsonBody as quizId;
  
      test.each([
        { test: 'Question string too short', token: user.token, 
        questionBody: {
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
          ]
        }, quizId: quiz.quizId},
        { test: 'Question string too long', token: user.token, 
        questionBody: {
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
          ]
        }, quizId: quiz.quizId },
        { test: 'Not enough answers', token: user.token, 
        questionBody: {
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
          ]
        }, quizId: quiz.quizId},
        { test: 'Question string too long', token: user.token, 
        questionBody: {
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
          ]
        }, quizId: quiz.quizId },
        { test: 'Too many answers', token: user.token, 
        questionBody: {
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
          ]
        }, quizId: quiz.quizId},
        { test: 'Question string too long', token: user.token, 
        questionBody: {
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
          ]
        }, quizId: quiz.quizId },
        { test: 'invalid duraion time(negative number)', token: user.token, 
        questionBody: {
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
          ]
        }, quizId: quiz.quizId},
        { test: 'Question string too long', token: user.token, 
        questionBody: {
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
          ]
        }, quizId: quiz.quizId },
        { test: 'invalid duration time(too long)', token: user.token, 
        questionBody: {
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
          ]
        }, quizId: quiz.quizId},
        { test: 'Question string too long', token: user.token, 
        questionBody: {
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
          ]
        }, quizId: quiz.quizId },
        { test: 'Points awarded invalid(too small)', token: user.token, 
        questionBody: {
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
          ]
        }, quizId: quiz.quizId},
        { test: 'Question string too long', token: user.token, 
        questionBody: {
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
          ]
        }, quizId: quiz.quizId },
        { test: 'Points awarded invalid(too large)', token: user.token, 
        questionBody: {
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
          ]
        }, quizId: quiz.quizId},
        { test: 'Question string too long', token: user.token, 
        questionBody: {
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
          ]
        }, quizId: quiz.quizId },
        { test: 'Duplicates answers in one question', token: user.token, 
        questionBody: {
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
          ]
        }, quizId: quiz.quizId},
        { test: 'Question string too long', token: user.token, 
        questionBody: {
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
          ]
        }, quizId: quiz.quizId },
        { test: 'No correct answers exist', token: user.token, 
        questionBody: {
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
          ]
        }, quizId: quiz.quizId},
        { test: 'Question string too long', token: user.token, 
        questionBody: {
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
          ]
        }, quizId: quiz.quizId },
      ])("requestUpdateUserDetails error: '$test'", ({token, questionBody, quizId }) => {
        requestRegister('validemail1@gmail.com', 'password7', 'Jennifer', 'Lawson');
        const response = requestQuizQuestionCreat(token, questionBody, quizId);
        expect(response.jsonBody).toStrictEqual({ error: expect.any(String) });
        expect(response.statusCode).toStrictEqual(400);
      });
    
  
    test('Error test for 401 error', () => {
      requestClear();
    });

    user = requestRegister('valideEmail@gmail.com', 'password1', 'Jane', 'Lawson').jsonBody as SessionId
    quiz = requestQuizCreate(user.token, 'British', 'history').jsonBody as quizId;
  
    test.each([
      {
        token: '',
        quizQuestion: {                                               // 	Token is empty
          questionBody: {
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
            ]
          }
        },
        quizId: quiz.quizId,
      },
      {
        token: user.token + 100,
        quizQuestion: {                                               // 	Token is invalid
          questionBody: {
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
            ]
          }
        },
        quizId: quiz.quizId,
      },
    ])(
      'Error with token="$token"',
      ({ token, quizQuestion, quizId }) => {
        const quizQuestionCreateResponse = requestQuizQuestionCreat(token, quizQuestion, quizId);
        expect(quizQuestionCreateResponse.statusCode).toStrictEqual(401);
        expect(quizQuestionCreateResponse.jsonBody).toStrictEqual({ error: expect.any(String) });
      });
    });
  
    test('Error test for 403 error, Valid token is provided, but user is not an owner of this quiz', () => {
      let user: SessionId;
      let quiz: quizId;
      
      user = requestRegister('valideEmail@gmail.com', 'password1', 'Jane', 'Lawson').jsonBody as SessionId
      quiz = requestQuizCreate(user.token, 'British', 'history').jsonBody as quizId;
  
      const quizQuestionCreatResponse = requestQuizQuestionCreat(user.token,
        {
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
          ]
        },
        quiz.quizId
      );
      expect(quizQuestionCreatResponse.statusCode).toStrictEqual(403);
      expect(quizQuestionCreatResponse.jsonBody).toStrictEqual({ error: expect.any(String) });
    });
});

