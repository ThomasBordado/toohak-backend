/**
 * Register a user with an email, password, and names, then returns their authUserId.
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} nameFirst - User's first name
 * @param {string} nameLast - User's last name
 * 
 * @returns {integer} authUserId - unique identifier for an academic
 */
function adminAuthRegister(email, password, nameFirst, nameLast) {
    return {
        authUserId: 1,
    };
}

/**
 * Given a registered user's email and password returns their authUserId value.
 * @param {string} email - User's email
 * @param {string} password - User's password
 * 
 * @returns {integer} authUserId - unique identifier for an academic
 */
function adminAuthLogin(email, password) {
    return {
        authUserId: 1,
    };
}
