import isEmail from 'validator/lib/isEmail.js';
import { getData } from './dataStore';
import { SessionId, user } from './interfaces';
/**
 * Check a given email. If valid return true and if the email
 * is in use or is invalid determined by validator return error object
 * @param {string} email - User's email
 *
 * @returns {boolean} - True if it is a valid email.
 * @returns {error: string} - If the email is in use or it is not an email.
 */
export const checkEmail = (email: string) => {
  const data = getData();
  if (data.users.length !== 0) {
    const emailCopy = data.users.find(users => users.email === email);
    if (emailCopy) {
      return { error: 'Email is in use' };
    }
  }

  if (!isEmail(email)) {
    return { error: 'This is not a valid email.' };
  }

  return true;
};

/**
 * Check the password validity.
 * Password is invalid if it is less than 8 characters or does not contain atleast 1 number and 1 letter.
 * @param {string} password - User's password
 *
 * @returns {boolean} - True if it is a valid password.
 * @returns {error: string} - If the password is invalid
 */
export const checkPassword = (password: string) => {
  if (password.length < 8) {
    return { error: 'Password must be 8 characters minimum.' };
  } else if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
    return { error: 'Password must contain atleast 1 number and 1 letter.' };
  }

  return true;
};

/**
 * Check if a valid name has been given
 * Name is invalid if it is less than 2 characters or more than 20 characters.
 * It also can only contain lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.
 * @param {string} name - User's name
 * @param {string} position - either a First or Last name.
 *
 * @returns {boolean} - True if it is a valid name.
 * @returns {error: string} - If the name is invalid
 */
export const checkName = (name: string, position: string) => {
  if (name.length < 2 || name.length > 20) {
    return { error: position + ' name must be between 2 to 20 characters.' };
  }
  for (const c of name) {
    if (!/[a-zA-Z\s'-]/.test(c)) {
      return { error: position + ' can only contain lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.' };
    }
  }

  return true;
};

/**
 * Given an authUserId and check if it's exists in the user list
 * @param {string} token - unique identifier for an login academic
 *
 * @return {boolean} -if Id is valid reutrn true, else return false
 */
export const isValidToken = (token: SessionId): boolean => {
  const data = getData();
  if (data.users.length === 0) {
    return false;
  }
  for (const users of data.users) {
    if (users.sessions.includes(parseInt(token.token))) {
      return true;
    }
  }
  return false;
};

/**
 * A helper function for my test. Show the user list
 *
 * @return {Array} -users from data
 */
export const usersList = (): user[] => {
  const data = getData();
  return (data.users);
};
/**
 * Given the two objects and check if they are the same
 * @param {object} - object1
 * @param {object} - object2
 *
 * @return {boolean} - return true if the two objects are the same
 */
export const isSame = (a: string, b: string): boolean => {
  if (a === b) {
    return true;
  }
  return false;
};

/**
 * Given the UserId and a password, check if the entered password correct
 * @param {number} authUserId - unique Id for user
 * @param {string} enterdPassword - the password entered
 *
 * @returns {boolean} - return false if password isn't correct
 */
export const isPasswordCorrect = (authUserId: number, enterdPassword: string): boolean => {
  const data = getData();
  const user = data.users.find(users => users.userId === authUserId);
  if (user.password === enterdPassword) {
    return true;
  } else {
    return false;
  }
};

/**
 * Given the UserId and new password, check if it's used before by this user
 * @param {string} newPassword -the new password
 * @param {string} authUserId - unique Id for authUser
 *
 * @return {boolean} - return false if the new password is not used before by the user
 */
export const isNewPasswordUsed = (authUserId: number, newPassword: string): boolean => {
  const data = getData();
  const user = data.users.find(users => users.userId === authUserId);

  // If prevpassword is empty
  if (user.prevpassword.length === 0) {
    return false;
  }

  const found = user.prevpassword.find(prevpassword => prevpassword === newPassword);
  if (found !== undefined) {
    return true;
  }
  return false;
};

/**
 * Check a given email. If valid return true and if the email
 * is in use by other users
 * @param {string} email - User's email
 *
 * @returns {boolean} - False if it is a used email.
 */
export const isEmailUsedByOther = (email: string, token: SessionId): boolean => {
  const data = getData();

  if (data.users.length === 0) {
    return false;
  }

  const userWithSameEmail = data.users.find(users => users.email === email && !users.sessions.includes(parseInt(token.token)));
  if (userWithSameEmail) {
    return true;
  }

  return false;
};
