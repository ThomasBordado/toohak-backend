/**
 * Register a user with an email, password, and names, then returns their authUserId.
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} nameFirst - User's first name
 * @param {string} nameLast - User's last name
 * 
 * @returns {number} authUserId - unique identifier for an academic, registering with email, password and name.
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
 * @returns {number} authUserId - unique identifier for an academic, given email and password
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
 * @returns {user:{userId: 1, name: 'Hayden Smith', email: 'hayden.smith@unsw.edu.au', numSuccessfulLogins: 3, numFailedPasswordsSinceLastLogin: 1,}} -
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
