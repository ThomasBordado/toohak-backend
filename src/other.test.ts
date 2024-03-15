import { clear } from './other';
import { adminAuthRegister, adminAuthLogin } from './auth';
import { adminQuizList, adminQuizCreate } from './quiz';
import { quizUser } from './interfaces';

beforeEach(() => {
  clear();
});

test('Test clear registered user', () => {
  expect(clear()).toStrictEqual({});

  // Register a user
  const user = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith');
  expect(user).toStrictEqual({ authUserId: expect.any(Number) });

  // Login successfully
  expect(adminAuthLogin('hayden.smith@unsw.edu.au', 'password1')).toStrictEqual(user);

  // Clear registered users
  expect(clear()).toStrictEqual({});

  // Unsuccessful login because user doesnt exist anymore
  expect(adminAuthLogin('hayden.smith@unsw.edu.au', 'password1')).toStrictEqual({ error: expect.any(String) });
});

// Add a test to clear quizzes when we are able to make quizzes.
test('Test clear quizzes', () => {
  let user: any = adminAuthRegister('haydensmith@gmail.com', 'password1', 'Tester', 'One');
  const quiz: any = adminQuizCreate(user.authUserId, 'My Quiz', 'My description.');
  const quiz2: any = adminQuizCreate(user.authUserId, 'My Second Quiz', 'My description.');
  const quiz3: any = adminQuizCreate(user.authUserId, 'My Third Quiz', 'My description.');
  const quizList: any = adminQuizList(user.authUserId);
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

  expect(adminQuizList(user.authUserId)).toStrictEqual({ error: expect.any(String) });
  user = adminAuthRegister('haydensmith@gmail.com', 'password1', 'Tester', 'One');
  expect(adminQuizList(user.authUserId)).toStrictEqual({ quizzes: [] });
});
