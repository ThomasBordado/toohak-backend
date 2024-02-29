import { getData } from './dataStore.js'

/**
 * Reset the state of the application back to the start.
 * @param {} - clears the state of the application back to the start
 * @returns {} - clears the state of the application back to the start
 */
function clear() {
  getData().users = [];
  getData().quizzes = [];
  return {};
}

  export { clear };