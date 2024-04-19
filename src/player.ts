import { getData } from './dataStore';
import { PlayerId, Player, PlayerStatus, PlayerQuestionInfo, Action, ErrorReturn, QuestionResults, correctusers } from './interfaces';
import { UpdateSessionState, quizQuestionCreate1 } from './quiz';
import { saveData } from './persistence';
import HTTPError from 'http-errors';
import { get } from 'http';

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

export const PlayerAnswerSubmission = (playerId: number, questionPosition: number, answerId: number[]) => {
  const data = getData();

  for (const quizSession of data.quizSessions) {
    if (quizSession.quizStatus.state !== 'QUESTION_OPEN') {
      throw HTTPError(400, 'Question is closed');
    }

    const player = quizSession.quizStatus.players.find(p => p.playerId === playerId);
    if (!player) {
      throw HTTPError(400, 'Player ID does not exist');
    }

    if (questionPosition < 1 || questionPosition > quizSession.quizStatus.metadata.numQuestions) {
      throw HTTPError(400, 'Question position is not valid for the session this player is in');
    }

    if (quizSession.quizStatus.atQuestion !== questionPosition) {
      throw HTTPError(400, 'Session is not currently on this question');
    }
    const questionIndex = questionPosition - 1; // Zero-based index adjustment
    const currentQuestion = quizSession.quizStatus.metadata.questions[questionIndex];
    if (!currentQuestion) {
      throw HTTPError(400, 'Question does not exist for the provided position');
    }

    const submittedAnswer = currentQuestion.answers.find(a => a.answerId === answerId[0]);
    if (!submittedAnswer) {
      throw HTTPError(400, 'Submitted answer ID is not valid for this question');
    }

    // Clear answerIds array and push the new answer ID
    player.answerIds = [];
    player.answerIds.push(answerId[0]);

    // Check if the submitted answer is correct
    if (submittedAnswer.correct) {
      // Update player's score
      player.score += currentQuestion.points;

      // Add the player to the correct user list for this question
      const correctUser: correctusers = {
        playerName: player.name,
      };
      const questionResultIndex = quizSession.quizResults.questionResults.findIndex(qr => qr.questionId === currentQuestion.questionId);
      if (questionResultIndex !== -1) {
        quizSession.quizResults.questionResults[questionResultIndex].playerCorrectList.push(correctUser);
      } else {
        const questionResults: QuestionResults = {
          questionId: currentQuestion.questionId,
          playerCorrectList: [correctUser],
          averageAnswerTime: 0, // Set the default value
          percentCorrect: 0, // Set the default value
        };
        quizSession.quizResults.questionResults.push(questionResults);
      }
    }
  }
};


export const PlayerQuestionResults = (playerId: number, questionposition: number): QuestionResults | ErrorReturn => {
  const sessions = getData().quizSessions;
  for (const session of sessions) {
    for (const player of session.quizStatus.players) {
      if (player.playerId === playerId) {
        if (questionposition < 1 || questionposition > session.quizStatus.metadata.numQuestions) {
          throw HTTPError(400, 'question position is not valid for the session this player is in');
        }
        if (session.quizStatus.atQuestion !== questionposition) {
          throw HTTPError(400, 'session is not currently on this question');
        }
        if (session.quizStatus.state !== 'ANSWER_SHOW') {
          throw HTTPError(400, 'Session is not in ANSWER_SHOW');
        }
        const question = session.quizStatus.metadata.questions[questionposition - 1];
      }
      return
    }
  }

}
