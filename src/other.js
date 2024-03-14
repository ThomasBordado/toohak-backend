import { getData } from './dataStore.js';

/**
 * Reset the state of the application back to the start.
 * @param {} - clears the state of the application back to the start
 * @returns {} - clears the state of the application back to the start
 */
function clear() {
  getData().users = [];
  getData().userIdStore = 0;
  getData().quizzes = [];
  getData().quizIdStore = 0;
  return {};
}

export { clear };
