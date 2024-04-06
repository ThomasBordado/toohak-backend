import { getData } from './dataStore';
import { EmptyObject } from './interfaces';
import { clearDataFile } from './persistence';

/**
 * Reset the state of the application back to the start.
 * @returns {} - clears the state of the application back to the start
 */
export const clear = (): EmptyObject => {
  console.log(getData().users);
  getData().users = [];
  getData().userIdStore = 0;
  getData().quizzes = [];
  getData().quizIdStore = 0;
  getData().sessionIdStore = 0;
  getData().questionIdStore = 0;
  getData().answerIdStore = 0;
  getData().trash = [];
  clearDataFile();
  return {};
};
