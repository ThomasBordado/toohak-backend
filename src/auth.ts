import { checkEmail, checkPassword, checkName, isValidToken, isSame, isPasswordCorrect, isNewPasswordUsed, isEmailUsedByOther } from './authUtil';
import isEmail from 'validator/lib/isEmail.js';
import { getData, setData } from './dataStore';
import { validUserId } from './quizUtil';
import { EmptyObject, ErrorReturn, UserDetailsReturn, user, SessionId } from './interfaces';
import { token } from 'morgan';

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
  const sessionId = data.sessionIdStore += 1;
  const newUser: user = {
    userId: data.userIdStore,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    prevpassword: [],
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    quizzes: [],
    sessions: [sessionId],
    trash: [],
  };

  data.users.push(newUser);
  return {
    token: sessionId.toString()
  };
};

/**
 * Given a registered user's email and password returns their authUserId value.
 * @param {string} email - User's email
 * @param {string} password - User's password
 *
 * @returns {sessionId: string} - unique identifier for a user session, given email and password
 */
export const adminAuthLogin = (email: string, password: string): SessionId | ErrorReturn => {
  const users = getData().users;
  if (users.length === 0) {
    return {
      error: 'Email address does not exist.'
    };
  }
  const user = users.find(users => users.email === email);
  if (user && user.password === password) {
    user.numSuccessfulLogins++;
    user.numFailedPasswordsSinceLastLogin = 0;

    const sessionId = getData().sessionIdStore += 1;
    user.sessions.push(sessionId);
    return {
      token: sessionId.toString()
    };
  } else if (user && user.password !== password) {
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
 * @param {number} authUserId - unique indentifier for an academic
 *
 * @returns {user: {userId: number, name: string, email: string, numSuccessfulLogins: number, numFailedPasswordsSinceLastLogin: number,}} -
 * Object containing user details
 *
 */
export const adminUserDetails = (authUserId: number): UserDetailsReturn | ErrorReturn => {
  const data = getData();
  const user = validUserId(authUserId, data.users);

  if ('error' in user) {
    return user;
  }
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
    if (users.sessions.includes(parseInt(token))) {
      users.email = email;
      users.nameFirst = nameFirst;
      users.nameLast = nameLast;
      setData(data);
      break;
    }
  }
  return {};
};

/**
*Given details relating to a password change, update the password of a logged in user.
* @param {number} authUserId - unique Id for authUser
* @param {string} oldPassword - the password user willing to change
* @param {string} newPassword - the new password
* @return {} - the password been updated
*/
export const adminUserPasswordUpdate = (authUserId: number, oldPassword: string, newPassword: string): EmptyObject | ErrorReturn => {
  // 1. Check if AuthUserId is valid
  if (!isValidToken(authUserId.toString())) {
    return { error: 'AuthUserId is not a valid user.' };
  }

  // 2. Check if the old password is correct
  if (!isPasswordCorrect(authUserId, oldPassword)) {
    return { error: 'Old Password is not the correct old password.' };
  }

  // 3. Check if the old and new passwords are exactly the same
  if (isSame(oldPassword, newPassword)) {
    return { error: 'Old Password and New Password match exactly.' };
  }

  // 4. Check if the password is used by this user
  if (isNewPasswordUsed(authUserId, newPassword)) {
    return { error: 'New Password has already been used before by this user.' };
  }

  // 5. Check is the new password valid
  if (checkPassword(newPassword) !== true) {
    return checkPassword(newPassword) as ErrorReturn;
  }

  const data = getData();
  const user = data.users.find(users => users.userId === authUserId);
  user.password = newPassword;
  user.prevpassword.push(oldPassword);
  setData(data);

  return {};
};
