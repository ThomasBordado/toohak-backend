/* 
 * Function stub for adminAuthRegister
 * Register a user with an email, password, and names,
 * then returns their authUserId.
 */
function adminAuthRegister(email, password, nameFirst, nameLast) {
    return {
        authUserId: 1,
    };
}

/* 
 * Function stub for adminAuthLogin
 * Given a registered user's email and password returns
 * their authUserId value.
 */
function adminAuthLogin(email, password) {
    return {
        authUserId: 1,
    };
}

/* 
 * Function stub for adminUserDetails
 * Given an admin user's authUserId, return details about the user.
 * "name" is the first and last name concatenated with a single
 * space between them.
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

/* 
 * Function stub for adminUserDetailsUpdate
 * Given an admin user's authUserId and a set of properties, update
 * the properties of this logged in admin user.
 */
function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {
    return { };
}