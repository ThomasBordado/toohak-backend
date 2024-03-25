import { clear } from './other';
import { adminAuthRegister, adminAuthLogin } from './auth';
import { adminQuizList, adminQuizCreate } from './quiz';
import { quizId, QuizListReturn, quizUser, SessionId } from './interfaces';

beforeEach(() => {
  clear();
});

test('Test clear registered user', () => {
  expect(clear()).toStrictEqual({});

  // Register a user
  const user = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith') as SessionId;
  expect(user).toStrictEqual({ sessionId: expect.any(Number) });

  // Login successfully
  expect(adminAuthLogin('hayden.smith@unsw.edu.au', 'password1')).toStrictEqual({ sessionId: expect.any(Number) });

  // Clear registered users
  expect(clear()).toStrictEqual({});

  // Unsuccessful login because user doesnt exist anymore
  expect(adminAuthLogin('hayden.smith@unsw.edu.au', 'password1')).toStrictEqual({ error: expect.any(String) });
});

// Add a test to clear quizzes when we are able to make quizzes.
test('Test clear quizzes', () => {
  let user = adminAuthRegister('haydensmith@gmail.com', 'password1', 'Tester', 'One') as SessionId;
  const quiz = adminQuizCreate(user.sessionId, 'My Quiz', 'My description.') as quizId;
  const quiz2 = adminQuizCreate(user.sessionId, 'My Second Quiz', 'My description.') as quizId;
  const quiz3 = adminQuizCreate(user.sessionId, 'My Third Quiz', 'My description.') as quizId;
  const quizList = adminQuizList(user.sessionId) as QuizListReturn;
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

  expect(clear()).toStrictEqual({});

  expect(adminQuizList(user.sessionId)).toStrictEqual({ error: expect.any(String) });
  user = adminAuthRegister('haydensmith@gmail.com', 'password1', 'Tester', 'One') as SessionId;
  expect(adminQuizList(user.sessionId)).toStrictEqual({ quizzes: [] });
});
