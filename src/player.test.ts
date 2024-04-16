import { requestRegister, requestClear } from './wrapper';
import { requestQuizCreate, requestQuizQuestionCreate, requestSessionStart, requestUpdateSessionState, requestPlayerJoin, requestPlayerStatus } from './wrapper2';
import { SessionId, questionId, quizId, quizQuestionCreateInput } from './interfaces';
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

/*
 * Testing for playerStatus
 */
describe('Test requestPlayerStatus', () => {
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
  // 1. Successful Player status
  test('Test playerStatus', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(requestPlayerStatus(playerId)).toStrictEqual({ state: 'LOBBY', numQuestions: 1, atQuestion: 0 });
  });

  // 2. Player id invalid
  test('Test player status missing player', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(requestPlayerStatus(playerId + 1)).toStrictEqual({ state: 'LOBBY', numQuestions: 1, atQuestion: 0 });
  });

});

/*
 * Testing for player question information
 */
describe('Test requestPlayerQuestionInfo', () => {
  let user: SessionId;
  let quiz: quizId;
  let questionin: quizQuestionCreateInput;
  let questionId: questionId;
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
      questionId = requestQuizQuestionCreate(user.token, questionin, quiz.quizId);
  });
  // 1. Successful Player status
  test('Test playerStatus', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    const result = requestPlayerQuestionInfo(playerId, 1);
    expect(result).toStrictEqual({ 
      questionId: questionId, 
      question: "Who is the Monarch of England?", 
      duration: 4, 
      thumbnailUrl: "http://google.com/some/image/path.jpg", 
      points: 5,
      answers: [
      {
        answerId: 2384, // This must be changed
        answer: "Prince Charles",
        colour: "red" // This also must be changed.
      }
      ]});
  });

  // 2. Player id invalid
  test('Test player status missing player', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(requestPlayerQuestionInfo(playerId + 1, 1)).toThrow(HTTPError[400]);
  });

  // 3. Invalid question position
  test('Test invalid question position', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(requestPlayerQuestionInfo(playerId + 1, 10)).toThrow(HTTPError[400]);
  });

  // 4. session is not on this question
  test('Test invalid question position', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(requestPlayerQuestionInfo(playerId + 1, 3)).toThrow(HTTPError[400]);
  });

  // 5. session is in LOBBY
  test('Test session is in LOBBY', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(requestPlayerQuestionInfo(playerId + 1, 1)).toThrow(HTTPError[400]);
  });

  // 6. session is in QUESTION_COUNTDOWN
  test('Test session is in QUESTION_COUNTDOWN', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(requestPlayerQuestionInfo(playerId + 1, 1)).toThrow(HTTPError[400]);
  });

  // 7. session is in END
  test('Test session is in END', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(requestPlayerQuestionInfo(playerId + 1, 1)).toThrow(HTTPError[400]);
  });

});
