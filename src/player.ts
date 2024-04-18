import { getData } from './dataStore';
import { PlayerId, Player, PlayerStatus, Action } from './interfaces';
import { UpdateSessionState } from './quiz';
import { saveData } from './persistence';
import HTTPError from 'http-errors';

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
