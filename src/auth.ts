import { checkEmail, checkPassword, checkName, isValidToken, isSame, isPasswordCorrect, isNewPasswordUsed, isEmailUsedByOther, getHashOf } from './authUtil';
import isEmail from 'validator/lib/isEmail.js';
import { getData, setData } from './dataStore';
import { validToken } from './quizUtil';
import { EmptyObject, ErrorReturn, UserDetailsReturn, user, SessionId } from './interfaces';
import { saveData } from './persistence';

/**
 * Register a user with an email, password, and names, then returns their authUserId.
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} nameFirst - User's first name
 * @param {string} nameLast - User's last name
 *
 * @returns {token: string} - unique identifier for a session, registering with email, password and name.
 */
export const adminAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string): SessionId | ErrorReturn => {
  if (checkEmail(email) !== true) {
    return checkEmail(email) as ErrorReturn;
  } else if (checkPassword(password) !== true) {
    return checkPassword(password) as ErrorReturn;
  } else if (checkName(nameFirst, 'First') !== true) {
    return checkName(nameFirst, 'First') as ErrorReturn;
  } else if (checkName(nameLast, 'Last') !== true) {
    return checkName(nameLast, 'Last') as ErrorReturn;
  }

  const data = getData();
  data.userIdStore += 1;
  data.sessionIdStore += 1;
  const sessionId = getHashOf(data.sessionIdStore.toString());
  const newUser: user = {
    userId: data.userIdStore,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: getHashOf(password),
    prevpassword: [],
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    quizzes: [],
    sessions: [sessionId],
    trash: [],
  };

  data.users.push(newUser);
  saveData();
  return {
    token: sessionId
  };
};

/**
 * Given a registered user's email and password returns their authUserId value.
 * @param {string} email - User's email
 * @param {string} password - User's password
 *
 * @returns {token: string} - unique identifier for a user session, given email and password
 */
export const adminAuthLogin = (email: string, password: string): SessionId | ErrorReturn => {
  const users = getData().users;
  if (users.length === 0) {
    return {
      error: 'Email address does not exist.'
    };
  }
  const user = users.find(users => users.email === email);
  if (user && user.password === getHashOf(password)) {
    user.numSuccessfulLogins++;
    user.numFailedPasswordsSinceLastLogin = 0;
    getData().sessionIdStore += 1;
    const sessionId = getHashOf(getData().sessionIdStore.toString());
    user.sessions.push(sessionId);
    saveData();
    return {
      token: sessionId
    };
  } else if (user && user.password !== getHashOf(password)) {
    user.numFailedPasswordsSinceLastLogin++;
    return {
      error: 'Password is not correct for the given email.'
    };
  }
  return {
    error: 'Email address does not exist.'
  };
};

/**
 * Given an admin user's authUserId, return details about the user.
 * "name" is the first and last name concatenated with a single space between them.
 * @param {string} token - unique indentifier for an academic session
 *
 * @returns {user: {userId: number, name: string, email: string, numSuccessfulLogins: number, numFailedPasswordsSinceLastLogin: number,}} -
 * Object containing user details
 *
 */
export const adminUserDetails = (token: string): UserDetailsReturn | ErrorReturn => {
  const data = getData();
  const user = validToken(token, data.users);

  saveData();
  return {
    user: {
      userId: user.userId,
      name: user.nameFirst + ' ' + user.nameLast,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
    }
  };
};

/**
 * Given an admin user's authUserId and a set of properties, update the properties of this logged in admin user.
 * @param {string} token - unique identifier for an academic
 * @param {string} email - User's email
 * @param {string} nameFirst - User's first name
 * @param {string} nameLast - User's last name
 *
 * @returns {} - For updated user details
 */
export const adminUserDetailsUpdate = (token: string, email: string, nameFirst: string, nameLast: string): EmptyObject | ErrorReturn => {
  // 1. Check if AuthUserId is a valid user
  if (!isValidToken(token)) {
    return { error: 'Token is empty or invalid' };
  }

  // 2. Check if the new email is invalid
  if (!isEmail(email)) {
    return { error: 'This is not a valid email.' };
  }

  // 3. Check if the email is used by another user(excluding the current authorised user)
  if (isEmailUsedByOther(email, token)) {
    return { error: 'Email is used by other user.' };
  }

  // 4. Check if NameFirst contains characters other than lowercase letters,
  // uppercase letters, spaces, hyphens, or apostrophes
  if (checkName(nameFirst, 'First') !== true) {
    return checkName(nameFirst, 'First') as ErrorReturn;
  }

  // 5. Check the length of NameLast
  if (checkName(nameLast, 'Last') !== true) {
    return checkName(nameLast, 'Last') as ErrorReturn;
  }

  // 6. Update the data
  const data = getData();
  for (const users of data.users) {
    if (users.sessions.includes(token)) {
      users.email = email;
      users.nameFirst = nameFirst;
      users.nameLast = nameLast;
      setData(data);
      break;
    }
  }
  saveData();
  return {};
};

/**
*Given details relating to a password change, update the password of a logged in user.
* @param {string} token - unique Id for logged in user
* @param {string} oldPassword - the password user willing to change
* @param {string} newPassword - the new password
* @return {} - the password been updated
*/
export const adminUserPasswordUpdate = (token: string, oldPassword: string, newPassword: string): EmptyObject | ErrorReturn => {
  // 1. Check if AuthUserId is valid
  if (!isValidToken(token)) {
    return { error: 'Token is empty or invalid' };
  }

  // 2. Check if the old password is correct
  if (!isPasswordCorrect(token, oldPassword)) {
    return { error: 'Old Password is not the correct old password.' };
  }

  // 3. Check if the old and new passwords are exactly the same
  if (isSame(oldPassword, newPassword)) {
    return { error: 'Old Password and New Password match exactly.' };
  }

  // 4. Check if the password is used by this user
  if (isNewPasswordUsed(token, newPassword)) {
    return { error: 'New Password has already been used before by this user.' };
  }

  // 5. Check is the new password valid
  if (checkPassword(newPassword) !== true) {
    return checkPassword(newPassword) as ErrorReturn;
  }

  const data = getData();
  const user = data.users.find(users => users.sessions.includes(token));
  user.password = getHashOf(newPassword);
  user.prevpassword.push(getHashOf(oldPassword));
  setData(data);
  saveData();
  return {};
};

/**
 * Given a registered user's email and password returns their authUserId value.
 * @param {string} token - Session ID as a string
 *
 * @returns {} - No return on successful logout,
 * Error if the session doesnt exist.
 */
export const adminAuthLogout = (token: string): EmptyObject | ErrorReturn => {
  const users = getData().users;
  for (const user of users) {
    if (user.sessions.includes(token)) {
      // If we find the session remove it from current sessions.
      const index = user.sessions.indexOf(token);
      if (index !== -1) {
        user.sessions.splice(index, 1);
      }
      saveData();
      return {};
    }
  }
  return {
    error: 'This is not a valid session.'
  };
};
