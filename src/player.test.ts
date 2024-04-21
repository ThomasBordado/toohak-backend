import { requestRegister, requestClear } from './wrapper';
import { requestQuizCreate, requestQuizQuestionCreate, requestSessionStart, requestPlayerJoin, requestPlayerStatus, requestPlayerQuestionInfo, requestUpdateSessionState, requestPlayerQuestionResults, requestPlayerSessionResults, requestPlayerAnswerSubmission } from './wrapper2';
import { SessionId, quizId, questionId, quizQuestionCreateInput, QuizSessionId, PlayerId } from './interfaces';
import HTTPError from 'http-errors';

// helper function for testing timers
function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

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

  test('Test Two players joining', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(playerId).toStrictEqual({ playerId: playerId.playerId });
    const playerId2 = requestPlayerJoin(session.sessionId, 'qwe123');
    expect(playerId2).toStrictEqual({ playerId: playerId2.playerId });
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
    expect(requestPlayerStatus(playerId.playerId)).toStrictEqual({ state: 'LOBBY', numQuestions: 1, atQuestion: 0 });
  });

  // 2. Player id invalid
  test('Test player status missing player', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(() => requestPlayerStatus(playerId.playerId + 1)).toThrow(HTTPError[400]);
  });
  test('Test State Changes after 3 players join', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');

    expect(playerId).toStrictEqual({ playerId: playerId.playerId });
    const playerId2 = requestPlayerJoin(session.sessionId, 'qwe123');

    expect(playerId2).toStrictEqual({ playerId: playerId2.playerId });
    const playerId3 = requestPlayerJoin(session.sessionId, '');

    expect(playerId3).toStrictEqual({ playerId: playerId3.playerId });
    expect(() => requestPlayerJoin(session.sessionId, '')).toThrow(HTTPError[400]);
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
    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION');
    sleepSync(3 * 1000);
    const result = requestPlayerQuestionInfo(playerId.playerId, 1);
    expect(result).toStrictEqual({
      questionId: questionId.questionId,
      question: 'Who is the Monarch of England?',
      duration: 4,
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
      points: 5,
      answers: [
        {
          answerId: expect.any(Number),
          answer: 'Prince Charles',
          colour: expect.any(String)
        },
        {
          answerId: expect.any(Number),
          answer: 'Prince Charlie',
          colour: expect.any(String)
        }
      ]
    });
  });

  // 2. Player id invalid
  test('Test player status missing player', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(() => requestPlayerQuestionInfo(playerId.playerId + 1, 1)).toThrow(HTTPError[400]);
  });

  // 3. Invalid question position
  test('Test invalid question position', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(() => requestPlayerQuestionInfo(playerId.playerId + 1, 10)).toThrow(HTTPError[400]);
  });

  // 4. session is not on this question
  test('Test invalid question position', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(() => requestPlayerQuestionInfo(playerId.playerId + 1, 3)).toThrow(HTTPError[400]);
  });

  // 5. session is in LOBBY
  test('Test session is in LOBBY', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(() => requestPlayerQuestionInfo(playerId.playerId + 1, 1)).toThrow(HTTPError[400]);
  });

  // 6. session is in QUESTION_COUNTDOWN
  test('Test session is in QUESTION_COUNTDOWN', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(() => requestPlayerQuestionInfo(playerId.playerId + 1, 1)).toThrow(HTTPError[400]);
  });

  // 7. session is in END
  test('Test session is in END', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'thomas');
    expect(() => requestPlayerQuestionInfo(playerId.playerId + 1, 1)).toThrow(HTTPError[400]);
  });
});

describe('Test requestPlayerAnswerSubmission', () => {
  let user: SessionId;
  let quiz: quizId;
  let questionin: quizQuestionCreateInput;
  let questionId;
  let session: QuizSessionId;
  let playerId: PlayerId
  beforeEach(() => {
    user = requestRegister('jared@gmail.com', 'password2024', 'Jared', 'Simion').jsonBody as SessionId;
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
    session = requestSessionStart(user.token, quiz.quizId, 3);
    playerId = requestPlayerJoin(session.sessionId, 'jared');
    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION');
    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'SKIP_COUNTDOWN');
  });

  // 1. Succesful answer submission
  test('Player Answer submit succesful', () => {
    const questionPosition = 1;
    const response = requestPlayerQuestionInfo(playerId.playerId, 1);
    const answerid = [response.answers[0].answerId];

    const result = requestPlayerAnswerSubmission(playerId.playerId, questionPosition, answerid);
    expect(result).toStrictEqual({});
  });

  // 2. Player does not exist
  test('test PlayerId does not exist', () => {
    const questionPosition = 1;
    const response = requestPlayerQuestionInfo(playerId.playerId, 1);
    const answerid = [response.answers[0].answerId];

    expect(() => requestPlayerAnswerSubmission(playerId.playerId + 1, questionPosition, answerid)).toThrow(HTTPError[400]);
  });

  // 3. Question position is not valid for the session this player is in
  test('test question position is not valid for this session', () => {
    const questionPosition = 10;
    const response = requestPlayerQuestionInfo(playerId.playerId, 1);
    const answerid = [response.answers[0].answerId];
    expect(() => requestPlayerAnswerSubmission(playerId.playerId, questionPosition, answerid)).toThrow(HTTPError[400]);
  });

  // 4. Session is not in QUESTION_OPEN state
  test('test Session not in "QUESTION_OPEN" state', () => {
    const questionPosition = 1;
    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER'); // Move to ANSWER_SHOW
    // console.log(session.sessionid)

    const response = requestPlayerQuestionInfo(playerId.playerId, 1);
    const answerid = [response.answers[0].answerId];
    expect(() => requestPlayerAnswerSubmission(playerId.playerId, questionPosition, answerid)).toThrow(HTTPError[400]);
  });

  // 5. session is not yet up to this question
  test('test Session not yet up to this question', () => {
    const questionPosition = 3;
    const response = requestPlayerQuestionInfo(playerId.playerId, 1);
    const answerid = [response.answers[0].answerId];
    expect(() => requestPlayerAnswerSubmission(playerId.playerId, questionPosition, answerid)).toThrow(HTTPError[400]);
  });

  // 6. Answer IDs are not valid for this particular question
  test('test Session Answer id not valid', () => {
    const questionPosition = 1;
    const answerid = [9999];
    expect(() => requestPlayerAnswerSubmission(playerId.playerId, questionPosition, answerid)).toThrow(HTTPError[400]);
  });

  // 7. Duplicate answer ids provided (unfinished) (Multiselect?)
  test('test Duplicate answer IDs provided', () => {
    const questionPosition = 1;
    const response = requestPlayerQuestionInfo(playerId.playerId, 1);
    const answerid = [response.answers[0].answerId, response.answers[0].answerId];
    expect(() => requestPlayerAnswerSubmission(playerId.playerId, questionPosition, answerid)).toThrow(HTTPError[400]);
  });

  // 8. less than one answer id was provided (Multiselect) (unfinished)
  test('less than one answer id was provided', () => {
    const questionPosition = 1;
    const answerid: number[] = []; // maybe?

    expect(() => requestPlayerAnswerSubmission(playerId.playerId, questionPosition, answerid)).toThrow(HTTPError[400]);
  });
});

describe('Test requestPlayerQuestionResults', () => {
  let user: SessionId;
  let quiz: quizId;
  let questionin: quizQuestionCreateInput;
  let questionId: questionId;
  let session: QuizSessionId;
  let playerId: PlayerId
  beforeEach(() => {
    user = requestRegister('jared@gmail.com', 'password2024', 'Jared', 'Simion').jsonBody as SessionId;
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
    requestQuizQuestionCreate(user.token, questionin, quiz.quizId);
    session = requestSessionStart(user.token, quiz.quizId, 3);
    playerId = requestPlayerJoin(session.sessionId, 'jared');
    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION');
    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'SKIP_COUNTDOWN');

  });

  // 1. succesful request player question results
  test('Succesful question results', () => {
    const response = requestPlayerQuestionInfo(playerId.playerId, 1);
    requestPlayerAnswerSubmission(playerId.playerId, 1, [response.answers[0].answerId]);

    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER');
    const result = requestPlayerQuestionResults(playerId.playerId, 1);
    console.log(result);
    expect(result).toStrictEqual({
      questionId: questionId.questionId,
      playersCorrectList: ['jared'],
      averageAnswerTime: 0,
      percentCorrect: 100
    });
  });

  // 2. player id does not exist
  test('Test playerid does not not exist', () => {
    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER');
    expect(() => requestPlayerQuestionResults(playerId.playerId + 1, 1)).toThrow(HTTPError[400]);
  });

  // 3. question id does not exist for the session the player is in
  test('Test questionId is not session valid', () => {
    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER');
    expect(() => requestPlayerQuestionResults(playerId.playerId, 10)).toThrow(HTTPError[400]);
  });

  // 4. session is not in ANSWER_SHOW
  test('test Session not in ANSWER_SHOW', () => {
    expect(() => requestPlayerQuestionResults(playerId.playerId, 1)).toThrow(HTTPError[400]);
  });

  test('Test session is not yet up to that question', () => {
    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER');
    expect(() => requestPlayerQuestionResults(playerId.playerId, 2)).toThrow(HTTPError[400]);
  });
});

describe('Test requestPlayerSessionResults', () => {
  describe('one player', () => {
    let user: SessionId;
    let quiz: quizId;
    let questionin: quizQuestionCreateInput;
    let questionId1: questionId;
    let questionId2: questionId;
    let session: QuizSessionId;
    let player: PlayerId
    beforeEach(() => {
      user = requestRegister('jared@gmail.com', 'password2024', 'Jared', 'Simion').jsonBody as SessionId;
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
      },
      questionId1 = requestQuizQuestionCreate(user.token, questionin, quiz.quizId);
      questionId2 = requestQuizQuestionCreate(user.token, questionin, quiz.quizId);
      session = requestSessionStart(user.token, quiz.quizId, 3);
      player = requestPlayerJoin(session.sessionId, 'jared');
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION'); // Move to QUESTION_OPEN
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'SKIP_COUNTDOWN');
    });
    test('Succesful case)', () => {
      const response = requestPlayerQuestionInfo(player.playerId, 1);
      requestPlayerAnswerSubmission(player.playerId, 1, [response.answers[0].answerId]);
      sleepSync(5000);
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION'); // Move to QUESTION_OPEN
      sleepSync(1000);
      requestPlayerAnswerSubmission(player.playerId, 2, [response.answers[1].answerId]);
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER'); // Move to ANSWER_SHOW
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'GO_TO_FINAL_RESULTS'); // Move to ANSWER_SHOW
      const expected = {
        usersRankedByScore: [
          {
            name: 'jared',
            score: 5
          }
        ],
        questionResults: [
          {
            questionId: questionId1.questionId,
            playersCorrectList: ['jared'],
            averageAnswerTime: 0,
            percentCorrect: 100
          },
          {
            questionId: questionId2.questionId,
            playersCorrectList: [],
            averageAnswerTime: 1,
            percentCorrect: 0
          }
        ]
      }
      expect(requestPlayerSessionResults(player.playerId)).toStrictEqual(expected);
    });
    test('Playerid does not exist', () => {
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER'); // Move to ANSWER_SHOW
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'GO_TO_FINAL_RESULTS'); // Move to ANSWER_SHOW
      expect(() => requestPlayerSessionResults(player.playerId + 1)).toThrow(HTTPError[400]);
    });
    test('Playerid does not exist', () => {
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER'); // Move to ANSWER_SHOW
      expect(() => requestPlayerSessionResults(player.playerId)).toThrow(HTTPError[400]);
    });
  });
  describe('two players', () => {
    let user: SessionId;
    let quiz: quizId;
    let questionin: quizQuestionCreateInput;
    let questionId1: questionId;
    let questionId2: questionId;
    let session: QuizSessionId;
    let player1: PlayerId
    let player2 : PlayerId
    beforeEach(() => {
      user = requestRegister('jared@gmail.com', 'password2024', 'Jared', 'Simion').jsonBody as SessionId;
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
      },
      questionId1 = requestQuizQuestionCreate(user.token, questionin, quiz.quizId);
      questionId2 = requestQuizQuestionCreate(user.token, questionin, quiz.quizId);
      session = requestSessionStart(user.token, quiz.quizId, 3);
      player1 = requestPlayerJoin(session.sessionId, 'jared');
      player1 = requestPlayerJoin(session.sessionId, 'chloe');
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION'); // Move to QUESTION_OPEN
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'SKIP_COUNTDOWN');
    });
    test('Succesful case)', () => {
      const response = requestPlayerQuestionInfo(player1.playerId, 1);
      requestPlayerAnswerSubmission(player1.playerId, 1, [response.answers[0].answerId]);
      sleepSync(1500);
      requestPlayerAnswerSubmission(player2.playerId, 1, [response.answers[1].answerId]);
      sleepSync(3500);
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION'); // Move to QUESTION_OPEN
      sleepSync(1000);
      requestPlayerAnswerSubmission(player1.playerId, 2, [response.answers[0].answerId]);
      sleepSync(2000);
      requestPlayerAnswerSubmission(player1.playerId, 2, [response.answers[0].answerId]);
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER'); // Move to ANSWER_SHOW
      requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'GO_TO_FINAL_RESULTS'); // Move to ANSWER_SHOW
      const expected = {
        usersRankedByScore: [
          {
            name: 'jared',
            score: 10
          },
          {
            name: 'chloe',
            score: 5
          }
        ],
        questionResults: [
          {
            questionId: questionId1.questionId,
            playersCorrectList: ['jared'],
            averageAnswerTime: 1,
            percentCorrect: 50
          },
          {
            questionId: questionId2.questionId,
            playersCorrectList: ['jared', 'chloe'],
            averageAnswerTime: 2,
            percentCorrect: 100
          }
        ]
      }
      expect(requestPlayerSessionResults(player1.playerId)).toStrictEqual(expected);
    });
  });
});
