import { requestRegister, requestClear } from './wrapper';
import { requestQuizCreate, requestQuizQuestionCreate, requestSessionStart, requestUpdateSessionState, requestPlayerJoin } from './wrapper2';
import { SessionId, quizId, quizQuestionCreateInput } from './interfaces';
import HTTPError from 'http-errors';

beforeEach(() => {
  requestClear();
});

/*
 * Testing for players joining to sessions
 */
describe('Test requestPlayerJoin', () => {
    let user: SessionId;
    let quiz: quizId;
    let questionin: quizQuestionCreateInput;
    beforeEach(() => {
        user = requestRegister('tom@gmail.com', 'password1', 'Thomas', 'Bordado').jsonBody as SessionId;
        quiz = requestQuizCreate(user.token, 'My Quiz', 'My Quiz Description');
        questionin = {
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 5,
        answers: [
            {
            answer: 'Prince Charles',
            correct: true
            },
            {
            answer: 'Prince Charlie',
            correct: false
            }
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
        };
        requestQuizQuestionCreate(user.token, questionin, quiz.quizId);
    });
  // 1. Successful Player joining
  test('Test player joining with name', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(playerId).toStrictEqual({ playerId: playerId.playerId });
  });

  // 2. Player joining invalid session
  test('Test player joining invalid session', () => {
    expect(() => requestPlayerJoin(1, 'thomas')).toThrow(HTTPError[400]);
  });

  // 3. Player joining session not in LOBBY state.
  test('Test player joining session not in LOBBY state', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    requestUpdateSessionState(quiz.quizId, session.sessionId, user.token, 'END');
    expect(() => requestPlayerJoin(session.sessionId, 'thomas')).toThrow(HTTPError[400]);
  });

  // 4. Players without unique names
  test('Test two players trying to join with same name', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(playerId).toStrictEqual({ playerId: playerId.playerId });
    expect(() => requestPlayerJoin(session.sessionId, 'thomas')).toThrow(HTTPError[400]);
  });

  // 5. Test randomly generated name
  test('Test randomly generated name when given empty name', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, '');
    expect(playerId).toStrictEqual({ playerId: playerId.playerId });
    // somehow check the name
  });
});