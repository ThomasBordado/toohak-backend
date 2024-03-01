import isEmail from 'validator/lib/isEmail.js';
import { getData, setData } from './dataStore.js';

/**
 * Check a given email. If valid return true and if the email
 * is in use or is invalid determined by validator return error object
 * @param {string} email - User's email
 * 
 * @returns {boolean} - True if it is a valid email.
 * @returns {error: string} - If the email is in use or it is not an email.
 */
function checkEmail(email) {
    let data = getData();
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
}


/**
 * Check the password validity. 
 * Password is invalid if it is less than 8 characters or does not contain atleast 1 number and 1 letter.
 * @param {string} password - User's password
 * 
 * @returns {boolean} - True if it is a valid password.
 * @returns {error: string} - If the password is invalid
 */
function checkPassword(password) {
    if (password.length < 8) {
        return { error: 'Password must be 8 characters minimum.' };
    } else if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
        return { error: 'Password must contain atleast 1 number and 1 letter.' };
    }

    return true;
}

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
function checkName(name, position) {
    if (name.length < 2 || name.length > 20) {
        return { error: position + ' name must be between 2 to 20 characters.' };
    } 
    for (const c of name) {
        if (!/[a-zA-Z\s'-]/.test(c)) {
            return { error: position + ' can only contain lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.' };
        }
    }

    return true;
}

/**
 * Given an authUserId and check if it's exists in the user list
 * @param {number} authUserId - unique identifier for an academic
 * 
 * @return {boolean} -if Id is valid reutrn true, else return false
 */
function isValidUserId(authUserId) {
    for (const users of data.users) {
        if (users.id === authUserId) {
            return true
        }
    }
    return false;
}

/**
 * Given an email and check if it's used by other users
 * @param {string} email -User's email
 * 
 * @return {boolean} -if the email is not used by another one
 *                     no reutrn true, yes return false
 */
function isEmailUsedByAnotherUser(authUserId, email) {
    for (const users of data.users) {
        if (users.id != authUserId && users.email === email) {
            return false;
        }
    }
    return true;

}


export { checkEmail, checkPassword, checkName, isValidUserId, isEmailUsedByAnotherUser };
