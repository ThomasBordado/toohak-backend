import { getData } from './dataStore';
import { EmptyObject } from './interfaces';
import { clearDataFile } from './persistence';

/**
 * Reset the state of the application back to the start.
 * @returns {} - clears the state of the application back to the start
 */
export const clear = (): EmptyObject => {
  getData().users = [];
  getData().userIdStore = 0;
  getData().quizzes = [];
  getData().quizIdStore = 0;
  getData().sessionIdStore = 0;
  getData().questionIdStore = 0;
  getData().answerIdStore = 0;
  getData().playerIdStore = 0;
  getData().trash = [];
  clearDataFile();
  return {};
};
