import { requestRegister, requestClear } from './wrapper';
import { requestQuizCreate, requestQuizQuestionCreate, requestSessionStart, requestPlayerJoin, requestPlayerStatus, requestPlayerQuestionInfo, requestUpdateSessionState, /*requestPlayerAnswerSubmission,*/ requestPlayerQuestionResults, requestPlayerSessionResults, requestPlayerAnswerSubmission } from './wrapper2';
import { SessionId, quizId, questionId, quizQuestionCreateInput } from './interfaces';
import HTTPError from 'http-errors';
import { get } from 'http';
import { getData } from './dataStore';

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
  let questionId: questionId;

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
  });

  //1. Succesful answer submission
  test('Player Answer submit succesful', () => {

    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'jared');
    const questionPosition = 1;

    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION');
    sleepSync(3 * 1000);

    const response = requestPlayerQuestionInfo(playerId.playerId, 1);
    const answerid = [response.answers[0].answerId];

    const result = requestPlayerAnswerSubmission(playerId.playerId, questionPosition, answerid);
    expect(result).toStrictEqual({});
  });

  // 2. Player does not exist
  test('test PlayerId does not exist', () => {

    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'jared');
    const questionPosition = 1;

    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION');
    sleepSync(3 * 1000);

    const response = requestPlayerQuestionInfo(playerId.playerId, 1);
    const answerid = [response.answers[0].answerId];

    expect(() => requestPlayerAnswerSubmission(playerId.playerId + 1, questionPosition, answerid)).toThrow(HTTPError[400]);
  });

  // 3. Question position is not valid for the session this player is in
  test('test question position is not valid for this session', () => {

    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'jared');
    const questionPosition = 10;

    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION');
    sleepSync(3 * 1000);


    const response = requestPlayerQuestionInfo(playerId.playerId, 1);
    const answerid = [response.answers[0].answerId];
    expect(() => requestPlayerAnswerSubmission(playerId.playerId, questionPosition, answerid)).toThrow(HTTPError[400]);
  });

  // 4. Session is not in QUESTION_OPEN state
  test('test Session not in "QUESTION_OPEN" state', () => {

    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'jared');
    const questionPosition = 1;

    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION'); //Move to QUESTION_OPEN
    sleepSync(3 * 1000);
    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER'); // Move to ANSWER_SHOW
    //console.log(session.sessionid)

    const response = requestPlayerQuestionInfo(playerId.playerId, 1);
    const answerid = [response.answers[0].answerId];
    expect(() => requestPlayerAnswerSubmission(playerId.playerId, questionPosition, answerid)).toThrow(HTTPError[400]);
  });


  // 5. session is not yet up to this question
  test('test Session not yet up to this question', () => {

    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'jared');
    const questionPosition = 3;

    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION'); //Move to QUESTION_OPEN
    sleepSync(3 * 1000);

    const response = requestPlayerQuestionInfo(playerId.playerId, 1);
    const answerid = [response.answers[0].answerId];
    expect(() => requestPlayerAnswerSubmission(playerId.playerId, questionPosition, answerid)).toThrow(HTTPError[400]);
  });

  // 6. Answer IDs are not valid for this particular question
  test('test Session Answer id not valid', () => {

    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'jared');
    const questionPosition = 1;

    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION'); //Move to QUESTION_OPEN
    sleepSync(3 * 1000);

    const answerid = [9999];

    expect(() => requestPlayerAnswerSubmission(playerId.playerId, questionPosition, answerid)).toThrow(HTTPError[400]);
  })

  // 7. Duplicate answer ids provided (unfinished) (Multiselect?)
  test('test Duplicate answer IDs provided', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'jared');
    const questionPosition = 1;

    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION'); //Move to QUESTION_OPEN
    sleepSync(3 * 1000);

    const response = requestPlayerQuestionInfo(playerId.playerId, 1);
    const answerid = [response.answers[0].answerId, response.answers[0].answerId];
    expect(() => requestPlayerAnswerSubmission(playerId.playerId, questionPosition, answerid)).toThrow(HTTPError[400]);
  });

  //8. less than one answer id was provided (Multiselect) (unfinished)
  test('less than one answer id was provided', () => {

    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerId = requestPlayerJoin(session.sessionId, 'jared');

    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION'); //Move to QUESTION_OPEN
    sleepSync(3 * 1000);

    const questionPosition = 1;
    const answerid: number[] = []; //maybe?

    expect(() => requestPlayerAnswerSubmission(playerId.playerId, questionPosition, answerid)).toThrow(HTTPError[400]);
  });
});



describe.skip('Test requestPlayerQuestionResults', () => {

  let user: SessionId;
  let quiz: quizId;
  let questionin: quizQuestionCreateInput;
  let questionId: questionId;

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
  });

  //1. succesful request player question results
  test('Succesful question results', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerid = requestPlayerJoin(session.sessionId, 'jared');
    requestUpdateSessionState(user.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION');
    sleepSync(3 * 1000);
    const questionPosition = 1;
    const result = requestPlayerQuestionResults(playerid.playerId, questionPosition);
    expect(result).toStrictEqual({
      questionId: questionId.questionId,
      playersCorrectList: [],
      averageAnswerTime: expect.any(Number),
      percentCorrect: expect.any(Number)
    });
  });


  //2. player id does not exist
  test('Test playerid does not not exist', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerid = requestPlayerJoin(session.sessionId, 'jared');

    expect(() => requestPlayerQuestionResults(playerid.playerId + 1, 1)).toThrow(HTTPError[400]);
  });

  //3. question id does not exist for the session the player is in
  test('Test questionId is not session valid', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerid = requestPlayerJoin(session.sessionId, 'jared');

    expect(() => requestPlayerQuestionResults(playerid.playerId, 10)).toThrow(HTTPError[400]);
  });

  //4. session is not in ANSWER_SHOW
  test('test Session not in ANSWER_SHOW', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerid = requestPlayerJoin(session.sessionId, 'jared');

    expect(() => requestPlayerQuestionResults(playerid.playerId, 1)).toThrow(HTTPError[400]);
  });

  test('Test session is not yet up to that question', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerid = requestPlayerJoin(session.sessionId, 'jared');

    expect(() => requestPlayerQuestionResults(playerid.playerId, 3)).toThrow(HTTPError[400]);
  });
});

describe.skip('Test requestPlayerSessionResults', () => {
  let user: SessionId;
  let quiz: quizId;
  beforeEach(() => {
    user = requestRegister('jared@gmail.com', 'password2024', 'Jared', 'Simion').jsonBody as SessionId;
    quiz = requestQuizCreate(user.token, 'My Quiz', 'My Quiz Description');


  })
  test('Succesful case)', () => {
    const session = requestSessionStart(user.token, quiz.quizId, 3);
    const playerid = requestPlayerJoin(session.sessionId, 'jared');

    const result = requestPlayerSessionResults(playerid);
    expect(result).toStrictEqual({
      usersRankedByScore: []
    })
  })
})