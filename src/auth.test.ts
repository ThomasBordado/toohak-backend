import { requestRegister, requestLogin, requestGetUserDetails, requestUpdateUserDetails, requestUpdatePassword, requestLogout, requestClear } from './wrapper';
import { usersList, getUserId, getHashOf } from './authUtil';
import { SessionId, UserId, user, UserDetailsReturn } from './interfaces';
import HTTPError from 'http-errors';

beforeEach(() => {
  requestClear();
});

/*
 * Testing for registering a user
 */
describe('Test requestRegister', () => {
  // 1. Successful Register of two users
  test('Test registering two users', () => {
    const response1 = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith');
    const response2 = requestRegister('thomas.bordado@unsw.edu.au', 'password2', 'Thomas', 'Bordado');
    const user1 = (response1.jsonBody as SessionId);
    const user2 = (response2.jsonBody as SessionId);
    expect(user1).toStrictEqual({ token: expect.any(String) });
    expect(user2).toStrictEqual({ token: expect.any(String) });
    expect(user1).not.toStrictEqual(user2);
    expect(response1.statusCode).toStrictEqual(200);
    expect(response2.statusCode).toStrictEqual(200);
  });

  // 2. Add an email and then try add the same email.
  test('Test email in use adminAuthRegister', () => {
    let response = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith');
    const user = (response.jsonBody as SessionId);
    expect(user).toStrictEqual({ token: expect.any(String) });
    expect(response.statusCode).toStrictEqual(200);
    response = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith');
    const error = response.jsonBody;
    expect(error).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  // 3. Provide an invlaid email.
  test('Test invalid email adminAuthRegister', () => {
    const response = requestRegister('hayden.smithson', 'password3', 'Hayden', 'Smith');
    expect(response.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  // 4. Invalid Characters in First name.
  test('Test first name invalid characters adminAuthRegister', () => {
    const res1 = requestRegister('hayden.smith@unsw.edu.au', 'password3', 'Hayden!', 'Smithson');
    const res2 = requestRegister('hayden.smith@unsw.edu.au', 'password3', 'Hayden1', 'Smithson');
    const res3 = requestRegister('hayden.smith@unsw.edu.au', 'password3', 'Hay?den', 'Smithson');

    expect(res1.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(res2.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(res3.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(res1.statusCode).toStrictEqual(400);
    expect(res2.statusCode).toStrictEqual(400);
    expect(res3.statusCode).toStrictEqual(400);
  });

  // 5. Invalid length of First name.
  test('Test first name invalid length adminAuthRegister', () => {
    const res1 = requestRegister('hayden.smith@unsw.edu.au', 'password3', 'H', 'Smithson');
    const res2 = requestRegister('hayden.smith@unsw.edu.au', 'password3', 'haydenhaydenhaydenhayden', 'Smithson');
    expect(res1.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(res2.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(res1.statusCode).toStrictEqual(400);
    expect(res2.statusCode).toStrictEqual(400);
  });

  // 6. Invalid Character in Last name.
  test('Test last name invalid characters adminAuthRegister', () => {
    const res1 = requestRegister('hayden.smith@unsw.edu.au', 'password3', 'Hayden', 'Smithson!');
    const res2 = requestRegister('hayden.smith@unsw.edu.au', 'password3', 'Hayden', 'Smithson1');
    const res3 = requestRegister('hayden.smith@unsw.edu.au', 'password3', 'Hayden', '{Smith}');
    expect(res1.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(res2.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(res3.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(res1.statusCode).toStrictEqual(400);
    expect(res2.statusCode).toStrictEqual(400);
    expect(res3.statusCode).toStrictEqual(400);
  });

  // 7. Invalid length of Last name.
  test('Test last name invalid length adminAuthRegister', () => {
    const res1 = requestRegister('hayden.smith@unsw.edu.au', 'password3', 'Hayden', 'S');
    const res2 = requestRegister('hayden.smith@unsw.edu.au', 'password3', 'Hayden', 'SmithSmithSmithSmithSmith');
    expect(res1.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(res2.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(res1.statusCode).toStrictEqual(400);
    expect(res2.statusCode).toStrictEqual(400);
  });

  // 8. Invalid password length.
  test('Test password invalid length adminAuthRegister', () => {
    const res = requestRegister('hayden.smith@unsw.edu.au', 'pass', 'Hayden', 'Smithson!');
    expect(res.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  // 9. Invalid password conditions.
  test('Test password invalid adminAuthRegister', () => {
    const res1 = requestRegister('hayden.smith@unsw.edu.au', 'password', 'Hayden', 'Smithson!');
    const res2 = requestRegister('hayden.smith@unsw.edu.au', '12345678', 'Hayden', 'Smithson!');
    expect(res1.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(res2.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(res1.statusCode).toStrictEqual(400);
    expect(res2.statusCode).toStrictEqual(400);
  });
});

/*
 * Testing for logging into a user account.
 */
describe('Test requestLogin', () => {
  // 1. Successful login to an existing account.
  test('Test successful login', () => {
    requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith');
    const res = requestLogin('hayden.smith@unsw.edu.au', 'password1');
    expect(res.jsonBody).toStrictEqual({ token: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);
  });

  // 2. Logging into an non-existing email then registering the email and logging in.
  test('Test email address does not exist', () => {
    let res = requestLogin('thomas@gmail.com', 'password1');
    expect(res.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
    requestRegister('thomas@gmail.com', 'password1', 'Thomas', 'Bordado');
    res = requestLogin('thomas@gmail.com', 'password1');
    expect(res.jsonBody).toStrictEqual({ token: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);
  });

  // 3. Incorrect Password for given email.
  test('Test incorrect password', () => {
    requestRegister('thomas@gmail.com', 'password1', 'Thomas', 'Bordado');
    const res = requestLogin('thomas@gmail.com', 'password2');
    expect(res.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  // 4. Incorrect Password for given email.
  test('Test login to two different sessions', () => {
    expect(requestRegister('thomas@gmail.com', 'password1', 'Thomas', 'Bordado').jsonBody).toStrictEqual({ token: expect.any(String) });
    const res1 = requestLogin('thomas@gmail.com', 'password1');
    const res2 = requestLogin('thomas@gmail.com', 'password1');
    expect(res1.jsonBody).toStrictEqual({ token: expect.any(String) });
    expect(res2.jsonBody).toStrictEqual({ token: expect.any(String) });
    expect(res1.statusCode).toStrictEqual(200);
    expect(res2.statusCode).toStrictEqual(200);
    expect(res1.jsonBody.token).not.toStrictEqual(res2.jsonBody.token);
  });

  test('Test numSuccessfulLogins and numFailedPasswordsSinceLastLogin', () => {
    // Register a user Hayden Smith
    const user = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith').jsonBody;
    // Get details of Hayden
    let details = requestGetUserDetails(user.token).jsonBody;
    // Check that he has only logged in once and had no fails
    expect(details.user.numSuccessfulLogins).toStrictEqual(1);
    expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    // Login to hayden
    requestLogin('hayden.smith@unsw.edu.au', 'password1');
    details = requestGetUserDetails(user.token).jsonBody as UserDetailsReturn;
    // Number of logins increase
    expect(details.user.numSuccessfulLogins).toStrictEqual(2);
    expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    // Fail a login
    requestLogin('hayden.smith@unsw.edu.au', 'password2');
    details = requestGetUserDetails(user.token).jsonBody as UserDetailsReturn;
    // Number of failed logins increase
    expect(details.user.numSuccessfulLogins).toStrictEqual(2);
    expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
    // Login correctly
    requestLogin('hayden.smith@unsw.edu.au', 'password1');
    details = requestGetUserDetails(user.token).jsonBody as UserDetailsReturn;
    // Number of failed logins resets to 0
    expect(details.user.numSuccessfulLogins).toStrictEqual(3);
    expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
  });
});

/*
 * Testing for getting user details
 */
describe('Test requestGetUserDetials', () => {
  // 1. Succesful return of account details
  test('Test succesful get user details', () => {
    const user1 = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith').jsonBody as SessionId;
    const result = requestGetUserDetails(user1.token);
    const userId = getUserId(user1.token) as UserId;
    const user = {
      userId: userId.authUserId,
      name: 'Hayden Smith',
      email: 'hayden.smith@unsw.edu.au',
      numSuccessfulLogins: 1,
      numFailedPasswordsSinceLastLogin: 0,
    };

    expect(result.jsonBody).toStrictEqual({ user: user });
    expect(result.statusCode).toStrictEqual(200);
  });

  // 2. Invalid authUserId
  test('Test Invalid User ID', () => {
    const user1 = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith').jsonBody as SessionId;
    const result = requestGetUserDetails(user1.token + 1);
    expect(result.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(401);
  });
});

/*
 * Testing for updating user details
 */
describe('requestUpdateUserDetails', () => {
  let data: SessionId;
  beforeEach(() => {
    requestClear();
    data = requestRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith').jsonBody as SessionId;
  });

  test.only('requestUpdateUserDetails error: invalid authUserId', () => {
    expect(() => requestUpdateUserDetails((data.token + 1) , 'validemail1@gmail.com', 'Jane', 'Smith')).toThrow(HTTPError[401]);
  });

  test.each([
    { test: 'invalid email', email: 'invalidemail', nameFirst: 'Jane', nameLast: 'Smith' },
    { test: 'email used by other', email: 'validemail1@gmail.com', nameFirst: 'Jane', nameLast: 'Smith' },
    { test: 'invalid nameFirst(contain invalid characters)', email: 'validemail@gmail.com', nameFirst: 'J++', nameLast: 'Smith' },
    { test: 'invalid nameFirst(too short)', email: 'validemail@gmail.com', nameFirst: 'J', nameLast: 'Smith' },
    { test: 'invalid nameFirst(too long)', email: 'validemail@gmail.com', nameFirst: 'JaneJaneJaneJaneJaneJane', nameLast: 'Smith' },
    { test: 'invalid nameLast(contain invalid characters)', email: 'validemail@gmail.com', nameFirst: 'Jane', nameLast: 'S++' },
    { test: 'invalid nameLast(too short)', email: 'validemail@gmail.com', nameFirst: 'Jane', nameLast: 'S' },
    { test: 'invalid nameLast(too long)', email: 'validemail@gmail.com', nameFirst: 'Jane', nameLast: 'SmithSmithSmithSmithSmith' },
  ])("requestUpdateUserDetails error: '$test'", ({ email, nameFirst, nameLast }) => {
    requestRegister('validemail1@gmail.com', 'password7', 'Jennifer', 'Lawson');
    expect(() => requestUpdateUserDetails(data.token, email, nameFirst, nameLast)).toThrow(HTTPError[400]);
  });

  // 2. Testing for return value
  test('requestUpdateUserDetails return type', () => {
    const response = requestUpdateUserDetails(data.token, 'validemail1@gmail.com', 'Jane', 'Smith');
    expect(response.jsonBody).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
  });

  // 3. Testing for behaviors
  // one user
  test('requestUpdateUserDetails one user', () => {
    requestUpdateUserDetails(data.token, 'validemail1@gmail.com', 'Jennifer', 'Lawson');
    const result = usersList().sort((a, b) => a.userId - b.userId);
    const userId = getUserId(data.token) as UserId;
    const users: user[] = [
      {
        userId: userId.authUserId,
        nameFirst: 'Jennifer',
        nameLast: 'Lawson',
        email: 'validemail1@gmail.com',
        password: getHashOf('1234567a'),
        prevpassword: [],
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
        quizzes: [],
        sessions: [data.token],
        trash: [],
      }
    ];
    const expectedList = users.sort((a, b) => a.userId - b.userId);
    expect(result).toStrictEqual(expectedList);
  });

  // more than one user
  test('requestUpdateUserDetails update (more than one user)', () => {
    const id2 = requestRegister('validemail2@gmail.com', '1234567a', 'Jane', 'Smith').jsonBody as SessionId;
    requestUpdateUserDetails(id2.token, 'validemail1@gmail.com', 'Jennifer', 'Lawson');
    const result = usersList().sort((a, b) => a.userId - b.userId);
    const userId = getUserId(data.token) as UserId;
    const userId2 = getUserId(id2.token) as UserId;
    const users: user[] =
          [{
            userId: userId.authUserId,
            nameFirst: 'Jane',
            nameLast: 'Smith',
            email: 'validemail@gmail.com',
            password: getHashOf('1234567a'),
            prevpassword: [],
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
            quizzes: [],
            sessions: [data.token],
            trash: [],
          }, {
            userId: userId2.authUserId,
            nameFirst: 'Jennifer',
            nameLast: 'Lawson',
            email: 'validemail1@gmail.com',
            password: getHashOf('1234567a'),
            prevpassword: [],
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
            quizzes: [],
            sessions: [id2.token],
            trash: [],
          }];
    const expectedList = users.sort((a, b) => a.userId - b.userId);
    expect(result).toStrictEqual(expectedList);
  });

  // Able to change if email is same as the old one
  test('requestUpdateUserDetails new email is as same as the old one', () => {
    const id2 = requestRegister('validemail2@gmail.com', '1234567a', 'Jane', 'Smith').jsonBody as SessionId;
    requestUpdateUserDetails(id2.token, 'validemail2@gmail.com', 'Jennifer', 'Lawson');
    const result = usersList().sort((a, b) => a.userId - b.userId);
    const userId = getUserId(data.token) as UserId;
    const userId2 = getUserId(id2.token) as UserId;
    const users: user[] =
          [{
            userId: userId.authUserId,
            nameFirst: 'Jane',
            nameLast: 'Smith',
            email: 'validemail@gmail.com',
            password: getHashOf('1234567a'),
            prevpassword: [],
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
            quizzes: [],
            sessions: [data.token],
            trash: [],
          }, {
            userId: userId2.authUserId,
            nameFirst: 'Jennifer',
            nameLast: 'Lawson',
            email: 'validemail2@gmail.com',
            password: getHashOf('1234567a'),
            prevpassword: [],
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
            quizzes: [],
            sessions: [id2.token],
            trash: [],
          }];
    const expectedList = users.sort((a, b) => a.userId - b.userId);
    expect(result).toStrictEqual(expectedList);
  });
});

/*
 * Testing for updating user password
 */
describe('requestUpdatePassword', () => {
  let data: SessionId;
  beforeEach(() => {
    data = requestRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith').jsonBody as SessionId;
  });

  test('adminUserPasswordUpdate error: invalid token', () => {
    expect(() => requestUpdatePassword((parseInt(data.token) + 1).toString(), '1234567a', '1234567b')).toThrow(HTTPError[401]);
  });

  test.each([
    { test: 'old password incorrect', oldPassword: '1234567b', newPassword: '1234567c' },
    { test: 'Old Password and New Password match exactly', oldPassword: '1234567a', newPassword: '1234567a' },
    { test: 'New password not valid(too short)', oldPassword: '1234567a', newPassword: '123' },
    { test: 'New password not valid(does not contain letter)', oldPassword: '1234567a', newPassword: '12345678' },
    { test: 'New password not valid(does not contain number)', oldPassword: '1234567a', newPassword: 'abcdefgh' },
  ])("adminUserPasswordUpdate error: '$test'", ({ oldPassword, newPassword }) => {
    expect(() => requestUpdatePassword(data.token, oldPassword, newPassword)).toThrow(HTTPError[400]);
  });

  // 2. Testing for return value
  test('adminUserPasswordUpdate return type', () => {
    const response = requestUpdatePassword(data.token, '1234567a', '1234567b');
    expect(response.jsonBody).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
  });

  // 3. Testing for behaviors
  // one user
  test('adminUserPasswordUpdate behavior1', () => {
    requestUpdatePassword(data.token, '1234567a', '1234567b');
    const result1 = usersList().sort((a, b) => a.userId - b.userId);
    const userId = getUserId(data.token) as UserId;
    const users1: user[] =
          [{
            userId: userId.authUserId,
            nameFirst: 'Jane',
            nameLast: 'Smith',
            email: 'validemail@gmail.com',
            password: getHashOf('1234567b'),
            prevpassword: [getHashOf('1234567a')],
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
            quizzes: [],
            sessions: [data.token],
            trash: [],
          }];
    const expectedList = users1.sort((a, b) => a.userId - b.userId);
    expect(result1).toStrictEqual(expectedList);
  });

  // more than one user and with requestUpdateUserDetails, many times
  test('adminUserPasswordUpdate behavior2', () => {
    const id2 = requestRegister('validemail2@gmail.com', '1234567a', 'Jennifer', 'Smith').jsonBody as SessionId;
    requestUpdatePassword(id2.token, '1234567a', '1234567b');
    requestUpdatePassword(id2.token, '1234567b', '1234567c');
    const result = usersList().sort((a, b) => a.userId - b.userId);
    const userId = getUserId(data.token) as UserId;
    const userId2 = getUserId(id2.token) as UserId;
    const users: user[] =
          [{
            userId: userId.authUserId,
            nameFirst: 'Jane',
            nameLast: 'Smith',
            email: 'validemail@gmail.com',
            password: getHashOf('1234567a'),
            prevpassword: [],
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
            quizzes: [],
            sessions: [data.token],
            trash: [],
          },
          {
            userId: userId2.authUserId,
            nameFirst: 'Jennifer',
            nameLast: 'Smith',
            email: 'validemail2@gmail.com',
            password: getHashOf('1234567c'),
            prevpassword: [getHashOf('1234567a'), getHashOf('1234567b')],
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
            quizzes: [],
            sessions: [id2.token],
            trash: [],
          }];
    const expectedList = users.sort((a, b) => a.userId - b.userId);
    expect(result).toStrictEqual(expectedList);
  });
});

/*
 * Testing for logging out of a session
 */
describe('Test requestLogout', () => {
  // 1. Successful logout after registering account.
  test('Test successful logout', () => {
    const sessionId = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith').jsonBody as SessionId;
    const res = requestLogout(sessionId.token);
    expect(res.jsonBody).toStrictEqual({ });
    expect(res.statusCode).toStrictEqual(200);
  });

  // 2. Successful logout after logging into an account.
  test('Test logout after logging in', () => {
    const sessionId1 = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith').jsonBody as SessionId;
    const sessionId2 = requestLogin('hayden.smith@unsw.edu.au', 'password1').jsonBody as SessionId;
    const res1 = requestLogout(sessionId1.token);
    expect(res1.jsonBody).toStrictEqual({ });
    expect(res1.statusCode).toStrictEqual(200);
    const res2 = requestLogout(sessionId2.token);
    expect(res2.jsonBody).toStrictEqual({ });
    expect(res2.statusCode).toStrictEqual(200);
  });

  // 3. Logging out of session that has been loggedout.
  test('Test logging out of session twice', () => {
    const sessionId1 = requestRegister('thomas@gmail.com', 'password1', 'Thomas', 'Bordado').jsonBody as SessionId;
    const res1 = requestLogout(sessionId1.token);
    expect(res1.jsonBody).toStrictEqual({ });
    expect(res1.statusCode).toStrictEqual(200);
    const res2 = requestLogout(sessionId1.token);
    expect(res2.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(res2.statusCode).toStrictEqual(401);
  });

  // 4. Logging out of non-existing session
  test('Test logout of invalid session', () => {
    const sessionId = requestRegister('thomas@gmail.com', 'password1', 'Thomas', 'Bordado').jsonBody as SessionId;
    expect(sessionId).toStrictEqual({ token: expect.any(String) });
    let newToken = parseInt(sessionId.token);
    newToken += 1;
    const res = requestLogout(newToken.toString());
    expect(res.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  // 4. Logging out of multiple sessions of different users
  test('Test logout of invalid session', () => {
    const sessionId1 = requestRegister('thomas@gmail.com', 'password1', 'Thomas', 'Bordado').jsonBody as SessionId;
    const sessionId2 = requestRegister('john@gmail.com', 'password2', 'John', 'Jonno').jsonBody as SessionId;
    const sessionId3 = requestRegister('phil@gmail.com', 'password3', 'phil', 'jacob').jsonBody as SessionId;
    const sessionId4 = requestLogin('phil@gmail.com', 'password3').jsonBody as SessionId;
    const sessionId5 = requestLogin('thomas@gmail.com', 'password1').jsonBody as SessionId;
    const res1 = requestLogout(sessionId1.token);
    const res2 = requestLogout(sessionId2.token);
    const res3 = requestLogout(sessionId3.token);
    const res4 = requestLogout(sessionId4.token);
    const res5 = requestLogout(sessionId5.token);
    expect(res1.jsonBody).toStrictEqual({ });
    expect(res1.statusCode).toStrictEqual(200);
    expect(res2.jsonBody).toStrictEqual({ });
    expect(res2.statusCode).toStrictEqual(200);
    expect(res3.jsonBody).toStrictEqual({ });
    expect(res3.statusCode).toStrictEqual(200);
    expect(res4.jsonBody).toStrictEqual({ });
    expect(res4.statusCode).toStrictEqual(200);
    expect(res5.jsonBody).toStrictEqual({ });
    expect(res5.statusCode).toStrictEqual(200);
  });
});
