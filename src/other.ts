import { getData } from './dataStore';
import { EmptyObject } from './interfaces';

/**
 * Reset the state of the application back to the start.
 * @returns {} - clears the state of the application back to the start
 */
export const clear = (): EmptyObject => {
  getData().users = [];
  getData().userIdStore = 0;
  getData().quizzes = [];
  getData().quizIdStore = 0;
  getData().userIdStore = 0;
  getData().sessionIdStore = 0;
  return {};
};
