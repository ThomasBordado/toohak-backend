import { requestRegister, requestLogin, requestClear, requestQuizList, requestQuizCreate } from './wrapper';
import { quizId, QuizListReturn, quizUser, SessionId } from './interfaces';

beforeEach(() => {
  requestClear();
});

test.skip('Test clear registered user', () => {
  expect(requestClear().jsonBody).toStrictEqual({});

  // Register a user
  const user = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith');
  expect(user.jsonBody).toStrictEqual({ token: expect.any(String) });

  // Login successfully
  expect(requestLogin('hayden.smith@unsw.edu.au', 'password1').jsonBody).toStrictEqual({ token: expect.any(String) });

  // Clear registered users
  expect(requestClear().jsonBody).toStrictEqual({});

  // Unsuccessful login because user doesnt exist anymore
  expect(requestLogin('hayden.smith@unsw.edu.au', 'password1').jsonBody).toStrictEqual({ error: expect.any(String) });
});

// Add a test to clear quizzes when we are able to make quizzes.
test.skip('Test clear quizzes', () => {
  let user = requestRegister('haydensmith@gmail.com', 'password1', 'Tester', 'One').jsonBody;
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

  quizList.quizzes.sort((a: quizUser, b:quizUser) => a.quizId - b.quizId);
  expectedList.quizzes.sort((a: quizUser, b: quizUser) => a.quizId - b.quizId);
  expect(quizList).toStrictEqual(expectedList);

  expect(requestClear().jsonBody).toStrictEqual({});

  expect(requestQuizList(user.token).jsonBody).toStrictEqual({ error: expect.any(String) });
  user = requestRegister('haydensmith@gmail.com', 'password1', 'Tester', 'One').jsonBody as SessionId;
  expect(requestQuizList(user.token).jsonBody).toStrictEqual({ quizzes: [] });
});
