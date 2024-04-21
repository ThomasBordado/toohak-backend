import { getData } from './dataStore';
import { PlayerId, Player, PlayerStatus, PlayerQuestionInfo, Action, ErrorReturn, QuestionResults, UserRank } from './interfaces';
import { UpdateSessionState } from './quiz';
import { saveData } from './persistence';
import HTTPError from 'http-errors';
import { playerIdToSession } from './quizUtil';

export const generateRandomName = (players: Player[]): string => {
  let letters = 'abcdefghijklmnopqrstuvwxyz';
  let numbers = '0123456789';

  let randomLetters = '';
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length);
    randomLetters += letters.charAt(randomIndex);
    letters = letters.slice(0, randomIndex) + letters.slice(randomIndex + 1);
  }

  let randomNumbers = '';
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * numbers.length);
    randomNumbers += numbers.charAt(randomIndex);
    numbers = numbers.slice(0, randomIndex) + numbers.slice(randomIndex + 1);
  }
  const newName = randomLetters + randomNumbers;
  // const players = getData().quizSessions.quizStatus.players;
  for (const player of players) {
    if (player.name === newName) {
      return generateRandomName(players);
    }
  }
  return newName;
};

export const playerJoin = (sessionId: number, name: string): PlayerId => {
  const sessions = getData().quizSessions;
  const sessionIndex = sessions.findIndex(sessions => sessions.sessionId === sessionId);
  if (sessionIndex === -1) {
    throw HTTPError(400, 'Session Id does not refer to a valid session');
  }
  if (sessions[sessionIndex].quizStatus.state !== 'LOBBY') {
    throw HTTPError(400, 'Session is not in LOBBY state');
  }
  const players = sessions[sessionIndex].quizStatus.players;
  if (name === '') {
    name = generateRandomName(players);
  }
  for (const player of players) {
    if (player.name === name) {
      throw HTTPError(400, 'Name of user entered is not unique');
    }
  }

  const data = getData();

  data.playerIdStore += 1;
  const newPlayer: Player = {
    playerId: data.playerIdStore,
    name: name,
    answerIds: [],
    score: 0
  };
  players.push(newPlayer);
  saveData();

  if (players.length === data.quizSessions[sessionIndex].autoStartNum) {
    const quizId = data.quizSessions[sessionIndex].quizStatus.metadata.quizId;
    const users = getData().users;
    let token = '';
    for (const user of users) {
      for (const quiz of user.quizzes) {
        if (quizId === quiz.quizId) {
          token = user.sessions[0];
          break;
        }
      }
    }
    UpdateSessionState(token, quizId, data.quizSessions[sessionIndex].sessionId, Action.NEXT_QUESTION);
  }
  return {
    playerId: newPlayer.playerId
  };
};

export const playerStatus = (playerId: number): PlayerStatus => {
  const sessions = getData().quizSessions;
  for (const session of sessions) {
    for (const player of session.quizStatus.players) {
      if (player.playerId === playerId) {
        const status = {
          state: session.quizStatus.state,
          numQuestions: session.quizStatus.metadata.numQuestions,
          atQuestion: session.quizStatus.atQuestion
        };
        return status;
      }
    }
  }
  throw HTTPError(400, 'player ID does not exist');
};

export const playerQuestionInfo = (playerId: number, questionPosition: number): PlayerQuestionInfo => {
  const sessions = getData().quizSessions;
  for (const session of sessions) {
    for (const player of session.quizStatus.players) {
      if (player.playerId === playerId) {
        if (questionPosition < 1 || questionPosition > session.quizStatus.metadata.numQuestions) {
          throw HTTPError(400, 'question position is not valid for the session this player is in');
        }
        if (session.quizStatus.atQuestion !== questionPosition) {
          throw HTTPError(400, 'session is not currently on this question');
        }
        if (session.quizStatus.state === 'LOBBY' || session.quizStatus.state === 'QUESTION_COUNTDOWN' || session.quizStatus.state === 'END') {
          throw HTTPError(400, 'Session is in LOBBY, QUESTION_COUNTDOWN, or END state');
        }
        const question = session.quizStatus.metadata.questions[questionPosition - 1];
        const answerReturn = [];
        for (const answer of question.answers) {
          const res = {
            answerId: answer.answerId,
            answer: answer.answer,
            colour: answer.colour
          };
          answerReturn.push(res);
        }
        const playerQuestionInfo = {
          questionId: question.questionId,
          question: question.question,
          duration: question.duration,
          thumbnailUrl: session.quizStatus.metadata.thumbnailUrl,
          points: question.points,
          answers: answerReturn
        };
        return playerQuestionInfo;
      }
    }
  }
  throw HTTPError(400, 'player ID does not exist');
};

export const PlayerAnswerSubmission = (playerId: number, questionPosition: number, answerIds: number[]) => {
  if (answerIds.length < 1) {
    throw HTTPError(400, 'At least one answer ID must be provided');
  }
  const session = playerIdToSession(playerId);
  const timeToSubmit = Math.floor(Date.now() / 1000) - session.timeQuestionOpen;
  session.timeSubmissionsTotal += timeToSubmit;

  if (session.quizStatus.state !== 'QUESTION_OPEN') {
    throw HTTPError(400, 'Question is closed');
  }
  if (questionPosition < 1 || questionPosition > session.quizStatus.metadata.numQuestions) {
    throw HTTPError(400, 'Question position is not valid for the session this player is in');
  }
  if (session.quizStatus.atQuestion !== questionPosition) {
    throw HTTPError(400, 'Session is not currently on this question');
  }

  const questionIndex = questionPosition - 1; // Zero-based index adjustment
  const currentQuestion = session.quizStatus.metadata.questions[questionIndex];
  if (!currentQuestion) {
    throw HTTPError(400, 'Question does not exist for the provided position');
  }

  // checks for duplicate answer id
  const answerIdSet = new Set(answerIds);
  // checks whether new set is different from array size, then throws error if difference
  if (answerIdSet.size !== answerIds.length) {
    throw HTTPError(400, 'Duplicate answer IDs provided');
  }

  const submittedAnswer = currentQuestion.answers.find(a => a.answerId === answerIds[0]);
  if (!submittedAnswer) {
    throw HTTPError(400, 'Submitted answer ID is not valid for this question');
  }

  const player = session.quizStatus.players.find(p => p.playerId === playerId);
  player.answerIds = answerIds;
  // Check if all correct answers are included in the user's submitted answers
  const allCorrectAnswers = currentQuestion.answers.filter(a => a.correct).map(a => a.answerId);
  const isCorrect = answerIds.length === allCorrectAnswers.length && answerIds.every(id => allCorrectAnswers.includes(id));
  const currentQuestionResults = session.quizResults.questionResults[questionIndex]
  if (isCorrect) {
    // Calculate scaling factor
    const correctUsersCount = session.quizResults.questionResults
      .find(qr => qr.questionId === currentQuestion.questionId)?.playersCorrectList.length ?? 0;
    const scalingFactor = correctUsersCount + 1;

    // Update player's score
    player.score += currentQuestion.points * (1 / scalingFactor);
    const playerRank = session.quizResults.usersRankedByScore.find(user => user.name === player.name);
    if (!playerRank){
      session.quizResults.usersRankedByScore.push({ name: player.name, score: player.score });
    } else {
      playerRank.score = player.score;
    }
    session.quizResults.usersRankedByScore.sort((a: UserRank, b: UserRank) => b.score - a.score);
    // Add the player to the correct user list for this question
    if (!currentQuestionResults.playersCorrectList.includes(player.name)) {
      currentQuestionResults.playersCorrectList.push(player.name)
    }
    // update percentage correct
    currentQuestionResults.percentCorrect = currentQuestionResults.playersCorrectList.length / session.quizStatus.players.length * 100;
  }

  // update average time
  let numberPlayersAnswered = 0;
  for (const players of session.quizStatus.players){
    if (players.answerIds.length > 0) {
      numberPlayersAnswered ++;
    }
  }
  currentQuestionResults.averageAnswerTime = session.timeSubmissionsTotal / numberPlayersAnswered;
  return {};
};


export const PlayerQuestionResults = (playerId: number, questionPosition: number): QuestionResults | ErrorReturn => {
  const sessions = getData().quizSessions;
  for (const session of sessions) {
    for (const player of session.quizStatus.players) {
      if (player.playerId === playerId) {
        if (questionPosition < 1 || questionPosition > session.quizStatus.metadata.numQuestions) {
          throw HTTPError(400, 'Question position is not valid for the session this player is in');
        }
        if (session.quizStatus.atQuestion !== questionPosition) {
          throw HTTPError(400, 'Session is not currently on this question');
        }
        if (session.quizStatus.state !== 'ANSWER_SHOW') {
          throw HTTPError(400, 'Session is not in ANSWER_SHOW');
        }
        const questionResult = session.quizResults.questionResults.find(result => result.questionId === session.quizStatus.metadata.questions[questionPosition - 1].questionId);

        return questionResult;
      }
    }
  }
  // If player not found
  throw HTTPError(400, 'Player ID does not exist');
};

export const playerSessionResults = (playerId: number) => {
  const sessions = getData().quizSessions;
  for (const session of sessions) {
    for (const player of session.quizStatus.players) {
      if (player.playerId === playerId) {
        if (session.quizStatus.state !== 'FINAL_RESULTS') {
          throw HTTPError(400, 'Session is not in FINAL_RESULTS');
        }
        return session.quizResults;
      }
    }
  }
  // If player not found
  throw HTTPError(400, 'Player ID does not exist');
};
