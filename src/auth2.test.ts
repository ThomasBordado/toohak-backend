import { requestRegister, requestLogin, requestClear } from './wrapper';
import { requestLogout, requestUpdateUserDetails, requestUpdatePassword, requestGetUserDetails } from './wrapper2';
import { SessionId, UserDetailsReturn } from './interfaces';
import HTTPError from 'http-errors';

beforeEach(() => {
  requestClear();
});

/*
 * Testing for getting user details
 */
describe('Test requestGetUserDetials', () => {
  // 1. Succesful return of account details
  test('Test succesful get user details', () => {
    const user1 = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith').jsonBody as SessionId;
    const result = requestGetUserDetails(user1.token) as UserDetailsReturn;
    const user = {
      userId: expect.any(Number),
      name: 'Hayden Smith',
      email: 'hayden.smith@unsw.edu.au',
      numSuccessfulLogins: 1,
      numFailedPasswordsSinceLastLogin: 0,
    };

    expect(result).toStrictEqual({ user: user });
  });

  // 2. Invalid authUserId
  test('Test Invalid User ID', () => {
    const user1 = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith').jsonBody as SessionId;
    expect(() => requestGetUserDetails(user1.token + 1)).toThrow(HTTPError[401]);
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

  test('requestUpdateUserDetails error: invalid authUserId', () => {
    expect(() => (requestUpdateUserDetails(data.token + 1, 'validemail@gmail.com', 'Jane', 'Smith')).toThrow(HTTPError[401]));
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
    expect(() => (requestUpdateUserDetails(data.token, email, nameFirst, nameLast)).toThrow(HTTPError[400]));
  });

  // 2. Testing for return value
  test('requestUpdateUserDetails return type', () => {
    expect(() => (requestUpdateUserDetails(data.token, 'validemail1@gmail.com', 'John', 'Smith')).not.toThrow(HTTPError));
    const returntype = requestUpdateUserDetails(data.token, 'validemail1@gmail.com', 'John', 'Smith');
    expect(returntype).toStrictEqual({ });
  });

  // 3. Testing for behaviors
  // one user
  test('requestUpdateUserDetails one user', () => {
    requestUpdateUserDetails(data.token, 'validemail1@gmail.com', 'Jennifer', 'Lawson');
    const userInfo = {
      userId: expect.any(Number),
      name: 'Jennifer Lawson',
      email: 'validemail1@gmail.com',
      numSuccessfulLogins: 1,
      numFailedPasswordsSinceLastLogin: 0,
    };
    const result = requestGetUserDetails(data.token) as UserDetailsReturn;
    expect(result).toStrictEqual({ user: userInfo });
  });

  // more than one user
  test('requestUpdateUserDetails update (more than one user)', () => {
    const id2 = requestRegister('validemail2@gmail.com', '1234567a', 'Jane', 'Smith').jsonBody as SessionId;
    requestUpdateUserDetails(id2.token, 'validemail1@gmail.com', 'Jennifer', 'Lawson');
    const userInfo1 = {
      userId: expect.any(Number),
      name: 'Jane Smith',
      email: 'validemail@gmail.com',
      numSuccessfulLogins: 1,
      numFailedPasswordsSinceLastLogin: 0,
    };
    const userInfo2 = {
      userId: expect.any(Number),
      name: 'Jennifer Lawson',
      email: 'validemail1@gmail.com',
      numSuccessfulLogins: 1,
      numFailedPasswordsSinceLastLogin: 0,
    };
    let result = requestGetUserDetails(data.token) as UserDetailsReturn;
    expect(result).toStrictEqual({ user: userInfo1 });

    result = requestGetUserDetails(id2.token) as UserDetailsReturn;
    expect(result).toStrictEqual({ user: userInfo2 });
  });

  // Able to change if email is same as the old one
  test('requestUpdateUserDetails new email is as same as the old one', () => {
    requestUpdateUserDetails(data.token, 'validemail@gmail.com', 'Jennifer', 'Lawson');
    const userInfo = {
      userId: expect.any(Number),
      name: 'Jennifer Lawson',
      email: 'validemail@gmail.com',
      numSuccessfulLogins: 1,
      numFailedPasswordsSinceLastLogin: 0,
    };
    const result = requestGetUserDetails(data.token) as UserDetailsReturn;
    expect(result).toStrictEqual({ user: userInfo });
  });
});

/*
 * Testing for updating user password
 */
describe('requestUpdatePassword', () => {
  let data: SessionId;
  beforeEach(() => {
    requestClear();
    data = requestRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith').jsonBody as SessionId;
  });

  test('adminUserPasswordUpdate error: invalid token', () => {
    expect(() => requestUpdatePassword((data.token + 1).toString(), '1234567a', '1234567b')).toThrow(HTTPError[401]);
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
    expect(() => (requestUpdatePassword(data.token, '1234567a', '1234567b')).not.toThrow(HTTPError));
    const returntype = requestUpdatePassword(data.token, '1234567a', '1234567b');
    expect(returntype).toStrictEqual({ });
  });

  // 3. Testing for behaviors
  // one user
  test('adminUserPasswordUpdate return type', () => {
    requestUpdatePassword(data.token, '1234567a', '1234567b');
    const response = requestLogin('validemail@gmail.com', '1234567a');
    expect(response.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
    expect(requestLogin('validemail@gmail.com', '1234567b').jsonBody).toStrictEqual({ token: expect.any(String) });
  });

  // more than one user and with requestUpdateUserDetails, many times
  test('adminUserPasswordUpdate return type', () => {
    const id2 = requestRegister('validemail2@gmail.com', '1234567a', 'Jennifer', 'Smith').jsonBody as SessionId;
    requestUpdatePassword(id2.token, '1234567a', '1234567b');
    requestUpdatePassword(id2.token, '1234567b', '1234567c');
    let response = requestLogin('validemail2@gmail.com', '1234567a');
    expect(response.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
    response = requestLogin('validemail2@gmail.com', '1234567b');
    expect(response.jsonBody).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
    expect(requestLogin('validemail2@gmail.com', '1234567c').jsonBody).toStrictEqual({ token: expect.any(String) });
    expect(requestLogin('validemail@gmail.com', '1234567a').jsonBody).toStrictEqual({ token: expect.any(String) });
  });
});

/*
 * Testing for logging out of a session
 */
describe('Test requestLogout', () => {
  // 1. Successful logout after registering account.
  test('Test successful logout', () => {
    const sessionId = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith').jsonBody as SessionId;
    expect(requestLogout(sessionId.token)).toStrictEqual({});
  });

  // 2. Successful logout after logging into an account.
  test('Test logout after logging in', () => {
    const sessionId1 = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith').jsonBody as SessionId;
    const sessionId2 = requestLogin('hayden.smith@unsw.edu.au', 'password1').jsonBody as SessionId;
    expect(requestLogout(sessionId1.token)).toStrictEqual({});
    expect(requestLogout(sessionId2.token)).toStrictEqual({});
  });

  // 3. Logging out of session that has been loggedout.
  test('Test logging out of session twice', () => {
    const sessionId1 = requestRegister('thomas@gmail.com', 'password1', 'Thomas', 'Bordado').jsonBody as SessionId;
    expect(requestLogout(sessionId1.token)).toStrictEqual({});
    expect(() => requestLogout(sessionId1.token)).toThrow(HTTPError[401]);
  });

  // 4. Logging out of non-existing session
  test('Test logout of invalid session', () => {
    const sessionId = requestRegister('thomas@gmail.com', 'password1', 'Thomas', 'Bordado').jsonBody as SessionId;
    expect(sessionId).toStrictEqual({ token: expect.any(String) });
    let newToken = parseInt(sessionId.token);
    newToken += 1;
    expect(() => requestLogout(newToken.toString())).toThrow(HTTPError[401]);
  });

  // 4. Logging out of multiple sessions of different users
  test('Test logout of many sessions', () => {
    const sessionId1 = requestRegister('thomas@gmail.com', 'password1', 'Thomas', 'Bordado').jsonBody as SessionId;
    const sessionId2 = requestRegister('john@gmail.com', 'password2', 'John', 'Jonno').jsonBody as SessionId;
    const sessionId3 = requestRegister('phil@gmail.com', 'password3', 'phil', 'jacob').jsonBody as SessionId;
    const sessionId4 = requestLogin('phil@gmail.com', 'password3').jsonBody as SessionId;
    const sessionId5 = requestLogin('thomas@gmail.com', 'password1').jsonBody as SessionId;
    expect(requestLogout(sessionId1.token)).toStrictEqual({});
    expect(requestLogout(sessionId2.token)).toStrictEqual({});
    expect(requestLogout(sessionId3.token)).toStrictEqual({});
    expect(requestLogout(sessionId4.token)).toStrictEqual({});
    expect(requestLogout(sessionId5.token)).toStrictEqual({});
  });
});
