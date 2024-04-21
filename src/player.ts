import { getData } from './dataStore';
import { PlayerId, Player, PlayerStatus, PlayerQuestionInfo, Action } from './interfaces';
import { UpdateSessionState } from './quiz';
import { saveData } from './persistence';
import HTTPError from 'http-errors';

/**
 * generates a random player name
 */
export const generateRandomName = (): string => {
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
  return newName;
};

/**
 * Allow player to join a quiz session
 * @param {number} sessionId - unique identifyer for a quiz session
 * @param {string} name - players name
 *
 * @returns {playerId: number} - unique identifier for a player
 */
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

  while (name === '' && players.find(player => player.name === name) === undefined) {
    name = generateRandomName();
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
    const user = users.find(users => users.quizzes.find(quizzes => quizzes.quizId === quizId));
    const token = user.sessions[0];
    UpdateSessionState(token, quizId, data.quizSessions[sessionIndex].sessionId, Action.NEXT_QUESTION);
  }
  return {
    playerId: newPlayer.playerId
  };
};

/**
 * Allow player to view their status
 * @param {number} playerId - unique identifyer for a player
 *
 * @returns {{ state: string, numQuestions: number, atQuestion: number }} - status of a player
 */
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

/**
 * Allow player to view their status
 * @param {number} playerId - unique identifyer for a player
 * @param {number} questionPosition - position of question that player attempts to view info
 * @returns {{ questionId: number, question: string, duration: number, thumbnailUrl: string, points: number, answers: Array<{ answerId: number, answer: string, colour: string }> }} - question info
 */
export const playerQuestionInfo = (playerId: number, questionPosition: number): PlayerQuestionInfo => {
  const sessions = getData().quizSessions;
  for (const session of sessions) {
    for (const player of session.quizStatus.players) {
      if (player.playerId === playerId) {
        if (session.quizStatus.state === 'LOBBY' || session.quizStatus.state === 'QUESTION_COUNTDOWN' || session.quizStatus.state === 'END') {
          throw HTTPError(400, 'Session is in LOBBY, QUESTION_COUNTDOWN, or END state');
        }
        if (questionPosition < 1 || questionPosition > session.quizStatus.metadata.numQuestions) {
          throw HTTPError(400, 'question position is not valid for the session this player is in');
        }
        if (session.quizStatus.atQuestion !== questionPosition) {
          throw HTTPError(400, 'session is not currently on this question');
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
