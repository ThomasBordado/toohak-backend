import { requestRegister, requestClear } from './wrapper';
import { requestQuizCreate, requestQuizQuestionCreate, requestSessionStart, requestPlayerJoin, requestUpdateSessionState } from './wrapper2';
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
    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'END');
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
  });

  //
  test('Test Two players joining', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(playerId).toStrictEqual({ playerId: playerId.playerId });
    const playerId2 = requestPlayerJoin(session.sessionId, 'qwe123');
    expect(playerId2).toStrictEqual({ playerId: playerId2.playerId });
  });

  test('Test State Changes after 3 players join', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(playerId).toStrictEqual({ playerId: playerId.playerId });
    const playerId2 = requestPlayerJoin(session.sessionId, 'qwe123');
    expect(playerId2).toStrictEqual({ playerId: playerId2.playerId });
    const playerId3 = requestPlayerJoin(session.sessionId, '');
    expect(playerId3).toStrictEqual({ playerId: playerId3.playerId });
    const playerId4 = requestPlayerJoin(session.sessionId, '');
    expect(playerId4).toStrictEqual({ playerId: playerId4.playerId });
  });
});
