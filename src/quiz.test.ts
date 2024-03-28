import { requestRegister, requestQuizList, requestQuizCreate, requestQuizTrash, requestClear, requestQuizInfo, requestUpdateQuizName, requestUpdateQuizDescription, requestQuizTrashEmpty } from './wrapper';
import { QuizListReturn, SessionId, quizId, quizUser } from './interfaces';

beforeEach(() => {
  requestClear();
});
/*
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
      const result = requestQuizTrash(user2.token, quiz.quizId);
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(403);
    });
    test('User owns quiz with same name as given quizId', () => {
      const user2 = requestRegister('chloet@gmail.com', 'password1', 'Chloe', 'Turner').jsonBody as SessionId;
      requestQuizCreate(user2.token, 'My Quiz', 'My description.');
      const result = requestQuizTrash(user2.token, quiz.quizId);
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
}); */

describe('adminQuizInfo testing', () => {
  let user: SessionId;
  let quiz: quizId;
  beforeEach(() => {
    user = requestRegister('ethan@gmail.com', 'password1', 'Ethan', 'McGregor').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.').jsonBody as quizId;
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid AuthUserId', () => {
      const result = requestQuizInfo(user.token + 1, quiz.quizId);
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(401);
    });
    test('Invalid quizId', () => {
      expect(requestQuizInfo(user.token, quiz.quizId + 1).jsonBody).toStrictEqual({ error: expect.any(String) });
    });
    test('User does not own quiz with given quizId', () => {
      const user2 = requestRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor').jsonBody as SessionId;
      const result = requestQuizInfo(user2.token, quiz.quizId);
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(403);
    });
    test('User owns quiz with same name as given quizId', () => {
      const user2 = requestRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor').jsonBody as SessionId;
      requestQuizCreate(user2.token, 'My Quiz', 'My description.');
      const result = requestQuizInfo(user2.token, quiz.quizId);
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(403);
    });
  });
  describe('Successful cases', () => {
    test('Return correct object containing quiz info', () => {
      const result = requestQuizInfo(user.token, quiz.quizId);
      expect(result.jsonBody).toStrictEqual({
        quizId: quiz.quizId,
        name: 'My Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'My description.',
      });
      expect(result.statusCode).toStrictEqual(200);
    });
  });
});

describe('adminQuizNameUpdate testing', () => {
  let user: SessionId;
  let quiz: quizId;
  beforeEach(() => {
    user = requestRegister('ethan@gmail.com', 'password1', 'Ethan', 'Mcgregor').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.').jsonBody as quizId;
  });

  describe('Unsuccessful Cases', () => {
    test('Invalid AuthUserId', () => {
      const result = requestUpdateQuizName(user.token + 1, quiz.quizId, 'Ethans quiz');
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(401);
    });
    test('Invalid quizId', () => {
      const result = requestUpdateQuizName(user.token, quiz.quizId + 1, 'Ethans quiz');
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(403);
    });
    test('User does not own quiz with given quizId', () => {
      const user2 = requestRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor').jsonBody as SessionId;
      const result = requestUpdateQuizName(user2.token, quiz.quizId, 'Ethans quiz');
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(403);
    });
    test('User owns quiz with same name as given quizId', () => {
      const user2 = requestRegister('ethanm@gmail.com', 'password12', 'Ethanm', 'EMcGregor').jsonBody as SessionId;
      requestQuizCreate(user2.token, 'My Quiz', 'My description.');
      const result = requestUpdateQuizName(user2.token, quiz.quizId, 'Ethans quiz');
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(403);
    });
    test('Invalid name: Contains non-alphanumeric characters', () => {
      const result = requestUpdateQuizName(user.token, quiz.quizId, 'My Quiz!');
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(400);
    });
    test('Invalid name: blank name', () => {
      const result = requestUpdateQuizName(user.token, quiz.quizId, '');
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(400);
    });
    test('Invalid name: < 3 characters', () => {
      const result = requestUpdateQuizName(user.token, quiz.quizId, 'My');
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(400);
    });
    test('Invalid name: > 30 characters', () => {
      const result = requestUpdateQuizName(user.token, quiz.quizId, 'My very very very very long Quiz');
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(400);
    });
    test('Invalid name: name already used', () => {
      requestQuizCreate(user.token, 'My Quiz', 'My description');
      const result = requestUpdateQuizName(user.token, quiz.quizId, 'My Quiz');
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(400);
    });
  });

  describe('Successful cases', () => {
    test('Return correct object containing quiz info', () => {
      const result = requestUpdateQuizName(user.token, quiz.quizId, 'Ethansquiz');
      expect(result.jsonBody).toStrictEqual({});
      expect(result.statusCode).toStrictEqual(200);
    });
    // test('names have been correctly updated', () => {
    //   let data = getData();
    //   adminQuizNameUpdate(user.authUserId, quiz.quizId, "Ethansquiz")
    //   expect(data.quizzes[0].name).toStrictEqual('banana');
    // });
    test('successfully change single name', () => {
      requestUpdateQuizName(user.token, quiz.quizId, 'Ethansquiz');
      const result = requestQuizList(user.token);
      expect(result.jsonBody).toStrictEqual({ quizzes: [{ quizId: quiz.quizId, name: 'Ethansquiz' }] });
      expect(result.statusCode).toStrictEqual(200);
    });
    test('successfully change multiple names', () => {
      const quiz2 = requestQuizCreate(user.token, 'My Second Quiz', 'My Second description.').jsonBody as quizId;
      const quiz3 = requestQuizCreate(user.token, 'My Third Quiz', 'My Third description.').jsonBody as quizId;
      requestUpdateQuizName(user.token, quiz.quizId, 'Ethansquiz');
      requestUpdateQuizName(user.token, quiz2.quizId, 'Ethanssecondquiz');
      const quizList = requestQuizList(user.token).jsonBody as QuizListReturn;
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
    user = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My description.').jsonBody as quizId;
  });

  // 1. Succesful quiz description update
  test('Test Succesful adminQuizDescriptionUpdate', () => {
    const result = requestUpdateQuizDescription(user.token, quiz.quizId, 'My updated description.');
    expect(result.jsonBody).toStrictEqual({});
  });

  // 2. Session token is not valid
  test('Test user.token is not valid', () => {
    const result = requestUpdateQuizDescription(user.token + 1, quiz.quizId, 'My updated description.');
    expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(401);
  });

  // 3. Quiz Id does not refer to a valid quiz
  test('Test quizid does not refer to valid quiz', () => {
    const result = requestUpdateQuizDescription(user.token, quiz.quizId + 1, 'My updated description.');
    expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(403);
  });

  // 4. Quiz Id does not refer to a quiz this user owns
  test('Test quizid does not refer to a quiz this user owns', () => {
    const user2 = requestRegister('jared@gmail.com', 'password3', 'Jared', 'Simion').jsonBody as SessionId;
    const notmyquiz = requestQuizCreate(user2.token, 'My Quiz2', 'My description.').jsonBody as quizId;
    const result = requestUpdateQuizDescription(user.token, notmyquiz.quizId, 'My updated description.');
    expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(403);
  });

  // 5. Quiz description is more than 100 characters long
  test('Test quiz description < 100 characters long', () => {
    const result = requestUpdateQuizDescription(user.token, quiz.quizId, 'My very, very, very, very, very, very, very, very, very, very, very, very, very, very, long description.');
    expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
});

describe('adminQuizTrashEmpty testing', () => {
  let user: SessionId;
  let quiz: quizId;
  beforeEach(() => {
    user = requestRegister('tom@gmail.com', 'password1', 'Tom', 'Thompson').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'First Quiz', 'Good description').jsonBody as quizId;
  });

  describe('Unsuccessful Cases', () => {
    // test('One quizId is not currently in the trash', () => {
    //   const quizIds: number[] = [quiz.quizId];
    //   // Convert the list to a JSON string
    //   const quizIdsString: string = JSON.stringify(quizIds);

    //   const result = requestQuizTrashEmpty(user.token, quizIdsString);
    //   expect(result.statusCode).toStrictEqual(400);
    //   expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
    // });

    test('All quiz ids are not in the trash', () => {
      const quiz2 = requestQuizCreate(user.token, 'Second Quiz', 'Better description').jsonBody as quizId;
      const quiz3 = requestQuizCreate(user.token, 'Third Quiz', 'Best description').jsonBody as quizId;

      // Send the first 2 quizzes into the trash
      requestQuizTrash(user.token, quiz.quizId);
      requestQuizTrash(user.token, quiz2.quizId);

      const quizIds: number[] = [quiz.quizId, quiz2.quizId, quiz3.quizId];
      // Convert the list to a JSON string
      const quizIdsString: string = JSON.stringify(quizIds);

      const result = requestQuizTrashEmpty(user.token, quizIdsString);
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(400);
    });

    test('Token refers to invalid session', () => {
      requestQuizTrash(user.token, quiz.quizId);

      const quizIds: number[] = [quiz.quizId];
      // Convert the list to a JSON string
      const quizIdsString: string = JSON.stringify(quizIds);

      const newToken = parseInt(user.token) + 1;
      const result = requestQuizTrashEmpty(newToken.toString(), quizIdsString);
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(401);
    });

    test('Token refers to empty session', () => {
      requestQuizTrash(user.token, quiz.quizId);

      const quizIds: number[] = [quiz.quizId];
      // Convert the list to a JSON string
      const quizIdsString: string = JSON.stringify(quizIds);

      const result = requestQuizTrashEmpty('', quizIdsString);
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(401);
    });

    test('Quiz is not owned by current session', () => {
      const user2 = requestRegister('John@gmail.com', 'password1', 'John', 'Flow').jsonBody as SessionId;
      const quiz2 = requestQuizCreate(user2.token, 'Quiz of John', 'Quiz of John').jsonBody as quizId;
      requestQuizTrash(user.token, quiz.quizId);
      requestQuizTrash(user2.token, quiz2.quizId);

      const quizIds: number[] = [quiz.quizId, quiz2.quizId];
      // Convert the list to a JSON string
      const quizIdsString: string = JSON.stringify(quizIds);

      const result = requestQuizTrashEmpty(user.token, quizIdsString);
      expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
      expect(result.statusCode).toStrictEqual(403);
    });
  });

  describe('Successful cases', () => {
    test('Empty One Item in Trash', () => {
      requestQuizTrash(user.token, quiz.quizId);

      const quizIds: number[] = [quiz.quizId];
      // Convert the list to a JSON string
      const quizIdsString: string = JSON.stringify(quizIds);

      const response = requestQuizTrashEmpty(user.token, quizIdsString);
      expect(response.jsonBody).toStrictEqual({});
      expect(response.statusCode).toStrictEqual(200);
    });

    test('Empty all items in Trash', () => {
      const quiz2 = requestQuizCreate(user.token, 'Second Quiz', 'Better description').jsonBody as quizId;
      const quiz3 = requestQuizCreate(user.token, 'Third Quiz', 'Best description').jsonBody as quizId;

      // Send the first 2 quizzes into the trash
      requestQuizTrash(user.token, quiz.quizId);
      requestQuizTrash(user.token, quiz2.quizId);
      requestQuizTrash(user.token, quiz3.quizId);

      const quizIds: number[] = [quiz.quizId, quiz2.quizId, quiz3.quizId];
      // Convert the list to a JSON string
      const quizIdsString: string = JSON.stringify(quizIds);

      const response = requestQuizTrashEmpty(user.token, quizIdsString);
      expect(response.jsonBody).toStrictEqual({});
      expect(response.statusCode).toStrictEqual(200);
    });

    test('Empty last item in Trash', () => {
      const quiz2 = requestQuizCreate(user.token, 'Second Quiz', 'Better description').jsonBody as quizId;
      const quiz3 = requestQuizCreate(user.token, 'Third Quiz', 'Best description').jsonBody as quizId;

      // Send the first 2 quizzes into the trash
      requestQuizTrash(user.token, quiz.quizId);
      requestQuizTrash(user.token, quiz2.quizId);
      requestQuizTrash(user.token, quiz3.quizId);

      const quizIds: number[] = [quiz3.quizId];
      // Convert the list to a JSON string
      const quizIdsString: string = JSON.stringify(quizIds);

      const response = requestQuizTrashEmpty(user.token, quizIdsString);
      expect(response.jsonBody).toStrictEqual({});
      expect(response.statusCode).toStrictEqual(200);
    });

    test('Empty first item in Trash', () => {
      const quiz2 = requestQuizCreate(user.token, 'Second Quiz', 'Better description').jsonBody as quizId;
      const quiz3 = requestQuizCreate(user.token, 'Third Quiz', 'Best description').jsonBody as quizId;

      // Send the first 2 quizzes into the trash
      requestQuizTrash(user.token, quiz.quizId);
      requestQuizTrash(user.token, quiz2.quizId);
      requestQuizTrash(user.token, quiz3.quizId);

      const quizIds: number[] = [quiz.quizId];
      // Convert the list to a JSON string
      const quizIdsString: string = JSON.stringify(quizIds);

      const response = requestQuizTrashEmpty(user.token, quizIdsString);
      expect(response.jsonBody).toStrictEqual({});
      expect(response.statusCode).toStrictEqual(200);
    });

    test('Empty odd items in Trash', () => {
      const quiz2 = requestQuizCreate(user.token, 'Second Quiz', 'Better description').jsonBody as quizId;
      const quiz3 = requestQuizCreate(user.token, 'Third Quiz', 'Best description').jsonBody as quizId;
      const quiz4 = requestQuizCreate(user.token, 'Fourth Quiz', 'Bad description').jsonBody as quizId;
      const quiz5 = requestQuizCreate(user.token, 'Fifth Quiz', 'Worst description').jsonBody as quizId;

      // Send the first 2 quizzes into the trash
      requestQuizTrash(user.token, quiz.quizId);
      requestQuizTrash(user.token, quiz2.quizId);
      requestQuizTrash(user.token, quiz3.quizId);
      requestQuizTrash(user.token, quiz4.quizId);
      requestQuizTrash(user.token, quiz5.quizId);

      const quizIds: number[] = [quiz.quizId, quiz3.quizId, quiz5.quizId];
      // Convert the list to a JSON string
      const quizIdsString: string = JSON.stringify(quizIds);

      const response = requestQuizTrashEmpty(user.token, quizIdsString);
      expect(response.jsonBody).toStrictEqual({});
      expect(response.statusCode).toStrictEqual(200);
    });
  });
});
