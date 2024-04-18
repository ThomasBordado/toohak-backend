import { getData } from './dataStore';
import { EmptyObject } from './interfaces';
import { clearDataFile } from './persistence';

const clearTimeouts = () => {
  const timeouts = getData().timers;
  for (const timeout of timeouts) {
    clearTimeout(timeout.timeoutId);
  }
};

/**
 * Reset the state of the application back to the start.
 * @returns {} - clears the state of the application back to the start
 */
export const clear = (): EmptyObject => {
  clearTimeouts();
  getData().users = [];
  getData().userIdStore = 0;
  getData().quizzes = [];
  getData().quizIdStore = 0;
  getData().sessionIdStore = 0;
  getData().questionIdStore = 0;
  getData().answerIdStore = 0;
  getData().playerIdStore = 0;
  getData().trash = [];
  getData().quizSessionIdStore = 0;
  getData().quizSessions = [];
  getData().timers = [];
  clearDataFile();
  return {};
};
