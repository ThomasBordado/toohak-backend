import { checkEmail, checkPassword, checkName } from './authUtil.js';
import { getData, setData } from './dataStore.js';

let userIdCounter = 0;

/**
 * Register a user with an email, password, and names, then returns their authUserId.
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} nameFirst - User's first name
 * @param {string} nameLast - User's last name
 * 
 * @returns {authUserId: number} - unique identifier for an academic, registering with email, password and name.
 */
function adminAuthRegister(email, password, nameFirst, nameLast) {
    if (checkEmail(email) !== true) {
        return checkEmail(email);
    } else if (checkPassword(password) !== true) {
        return checkPassword(password);
    } else if (checkName(nameFirst, "First") !== true) {
        return checkName(nameFirst, "First");
    } else if (checkName(nameLast, "Last") !== true) {
        return checkName(nameLast, "Last");
    }

    let data = getData();
    userIdCounter++;
    let newUser = {
        userId: userIdCounter,
        nameFirst: nameFirst,
        nameLast: nameLast,
        email: email,
        password: password,
        numSuccessfulLogins: 0,
        numFailedPasswordsSinceLastLogin: 0,
        quizzes: [],
    };

    data.users.push(newUser);

    return {
        authUserId: newUser.userId
    };
}

//console.log(adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith'));
//console.log(adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith'));


/**
 * Given a registered user's email and password returns their authUserId value.
 * @param {string} email - User's email
 * @param {string} password - User's password
 * 
 * @returns {authUserId: number} - unique identifier for an academic, given email and password
 */
function adminAuthLogin(email, password) {
    return {
        authUserId: 1,
    };
}

/** 
 * Given an admin user's authUserId, return details about the user.
 * "name" is the first and last name concatenated with a single space between them.
 * @param {number} authUserId - unique indentifier for an academic
 * 
 * @returns {user: {userId: number, name: string, email: string, numSuccessfulLogins: number, numFailedPasswordsSinceLastLogin: number,}} -
 * Object containing user details
 * 
 */
function adminUserDetails(authUserId) {
    return {
        user: {
            userId: 1, 
            name: 'Hayden Smith', 
            email: 'hayden.smith@unsw.edu.au',
            numSuccessfulLogins: 3, 
            numFailedPasswordsSinceLastLogin: 1,
        } 
    };
}

/**
 * Given an admin user's authUserId and a set of properties, update the properties of this logged in admin user.
 * @param {number} authUserId - unique identifier for an academic
 * @param {string} email - User's email
 * @param {string} nameFrist - User's first name
 * @param {string} nameLast - User's last name
 * 
 * @returns {} - For updated user details 
 */
function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {
    return { };
}

/** 
*Given details relating to a password change, update the password of a logged in user.
* @param {number} authUserId - unique Id for authUser
* @param {string} oldPassword - the password user willing to change
* @param {string} newPassword - the new password
* @return {} - the password been updated
*/
function adminUserPasswordUpdate( authUserId, oldPassword, newPassword ) {
    return {};
}

export { adminAuthRegister };