import { requestRegister, requestLogin, requestClear } from './wrapper';
// import { usersList } from './authUtil';
import { SessionId } from './interfaces';

beforeEach(() => {
  requestClear();
});

describe('Test adminAuthRegister', () => {
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

describe('Test adminAuthLogin', () => {
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

  /* test('Test numSuccessfulLogins and numFailedPasswordsSinceLastLogin', () => {
    // Register a user Hayden Smith
    const user = requestRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith').jsonBody;
    // Get details of Hayden
    let details = requestGetUserDetails(user.sessionId).jsonBody;
    // Check that he has only logged in once and had no fails
    expect(details.user.numSuccessfulLogins).toStrictEqual(1);
    expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    // Login to hayden
    requestLogin('hayden.smith@unsw.edu.au', 'password1');
    details = requestGetUserDetails(user.sessionId).jsonBody as UserDetailsReturn;
    // Number of logins increase
    expect(details.user.numSuccessfulLogins).toStrictEqual(2);
    expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    // Fail a login
    requestLogin('hayden.smith@unsw.edu.au', 'password2');
    details = requestGetUserDetails(user.sessionId).jsonBody as UserDetailsReturn;
    // Number of failed logins increase
    expect(details.user.numSuccessfulLogins).toStrictEqual(2);
    expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
    // Login correctly
    requestLogin('hayden.smith@unsw.edu.au', 'password1');
    details = requestGetUserDetails(user.sessionId).jsonBody as UserDetailsReturn;
    // Number of failed logins resets to 0
    expect(details.user.numSuccessfulLogins).toStrictEqual(3);
    expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
  }); */
});
/*
describe('Test adminUserDetails', () => {
  // 1. Succesful return of account details
  test('Test succesful get user details', () => {
    const user1 = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith') as UserId;
    const result = adminUserDetails(user1.authUserId);
    const user = {
      userId: user1.authUserId,
      name: 'Hayden Smith',
      email: 'hayden.smith@unsw.edu.au',
      numSuccessfulLogins: 1,
      numFailedPasswordsSinceLastLogin: 0,
    };

    expect(result).toStrictEqual({ user: user });
  });

  // 2. Invalid authUserId
  test('Test Invalid User ID', () => {
    const user1 = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith') as UserId;
    expect(adminUserDetails(user1.authUserId + 1)).toStrictEqual({ error: expect.any(String) });
  });
});
*/
/**
 * Test for adminUserDetailsUpdate
 */
/*
describe('adminUserDetailsUpdate', () => {
  let data: UserId;
  beforeEach(() => {
    data = adminAuthRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith') as UserId;
  });

  test('adminUserDetailsUpdate error: invalid authUserId', () => {
    expect(adminUserDetailsUpdate(data.authUserId + 1, 'validemail1@gmail.com', 'Jane', 'Smith')).toStrictEqual({ error: expect.any(String) });
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
  ])("adminUserDetailsUpdate error: '$test'", ({ email, nameFirst, nameLast }) => {
    adminAuthRegister('validemail1@gmail.com', 'password7', 'Jennifer', 'Lawson');
    expect(adminUserDetailsUpdate(data.authUserId, email, nameFirst, nameLast)).toStrictEqual({ error: expect.any(String) });
  });

  // 2. Testing for return value
  test('adminUserDetailsUpdate return type', () => {
    expect(adminUserDetailsUpdate(data.authUserId, 'validemail1@gmail.com', 'Jane', 'Smith')).toStrictEqual({});
  });

  // 3. Testing for behaviors
  // one user
  test('adminUserDetailsUpdate one user', () => {
    adminUserDetailsUpdate(data.authUserId, 'validemail1@gmail.com', 'Jennifer', 'Lawson');
    const result = usersList().sort((a, b) => a.userId - b.userId);
    const users: user[] = [
      {
        userId: data.authUserId,
        nameFirst: 'Jennifer',
        nameLast: 'Lawson',
        email: 'validemail1@gmail.com',
        password: '1234567a',
        prevpassword: [],
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
        quizzes: [],
      }
    ];
    const expectedList = users.sort((a, b) => a.userId - b.userId);
    expect(result).toStrictEqual(expectedList);
  });

  // more than one user
  test('adminUserDetailsUpdate update (more than one user)', () => {
    const id2 = adminAuthRegister('validemail2@gmail.com', '1234567a', 'Jane', 'Smith') as UserId;
    adminUserDetailsUpdate(id2.authUserId, 'validemail1@gmail.com', 'Jennifer', 'Lawson');
    const result = usersList().sort((a, b) => a.userId - b.userId);
    const users: user[] =
          [{
            userId: data.authUserId,
            nameFirst: 'Jane',
            nameLast: 'Smith',
            email: 'validemail@gmail.com',
            password: '1234567a',
            prevpassword: [],
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
            quizzes: [],
          }, {
            userId: id2.authUserId,
            nameFirst: 'Jennifer',
            nameLast: 'Lawson',
            email: 'validemail1@gmail.com',
            password: '1234567a',
            prevpassword: [],
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
            quizzes: [],
          }];
    const expectedList = users.sort((a, b) => a.userId - b.userId);
    expect(result).toStrictEqual(expectedList);
  });

  // Able to change if email is same as the old one
  test('adminUserDetailsUpdate new email is as same as the old one', () => {
    const id2 = adminAuthRegister('validemail2@gmail.com', '1234567a', 'Jane', 'Smith') as UserId;
    adminUserDetailsUpdate(id2.authUserId, 'validemail2@gmail.com', 'Jennifer', 'Lawson');
    const result = usersList().sort((a, b) => a.userId - b.userId);
    const users: user[] =
          [{
            userId: data.authUserId,
            nameFirst: 'Jane',
            nameLast: 'Smith',
            email: 'validemail@gmail.com',
            password: '1234567a',
            prevpassword: [],
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
            quizzes: [],
          }, {
            userId: id2.authUserId,
            nameFirst: 'Jennifer',
            nameLast: 'Lawson',
            email: 'validemail2@gmail.com',
            password: '1234567a',
            prevpassword: [],
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
            quizzes: [],
          }];
    const expectedList = users.sort((a, b) => a.userId - b.userId);
    expect(result).toStrictEqual(expectedList);
  });
});
*/
/**
 * Test for user password update
 */
/*
describe('adminUserPasswordUpdate', () => {
  let data: UserId;
  beforeEach(() => {
    data = adminAuthRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith') as UserId;
  });

  test('adminUserPasswordUpdate error: invalid authUserId', () => {
    expect(adminUserPasswordUpdate(data.authUserId + 1, '1234567a', '1234567b')).toStrictEqual({ error: expect.any(String) });
  });

  test.each([
    { test: 'old password incorrect', oldPassword: '1234567b', newPassword: '1234567c' },
    { test: 'Old Password and New Password match exactly', oldPassword: '1234567a', newPassword: '1234567a' },
    { test: 'New password not valid(too short)', oldPassword: '1234567a', newPassword: '123' },
    { test: 'New password not valid(does not contain letter)', oldPassword: '1234567a', newPassword: '12345678' },
    { test: 'New password not valid(does not contain number)', oldPassword: '1234567a', newPassword: 'abcdefgh' },
  ])("adminUserPasswordUpdate error: '$test'", ({ oldPassword, newPassword }) => {
    expect(adminUserPasswordUpdate(data.authUserId, oldPassword, newPassword)).toStrictEqual({ error: expect.any(String) });
  });

  // 2. Testing for return value
  test('adminUserPasswordUpdate return type', () => {
    expect(adminUserPasswordUpdate(data.authUserId, '1234567a', '1234567b')).toStrictEqual({});
  });

  // 3. Testing for behaviors
  // one user
  test('adminUserPasswordUpdate return type', () => {
    adminUserPasswordUpdate(data.authUserId, '1234567a', '1234567b');
    const result1 = usersList().sort((a, b) => a.userId - b.userId);
    const users1: user[] =
          [{
            userId: data.authUserId,
            nameFirst: 'Jane',
            nameLast: 'Smith',
            email: 'validemail@gmail.com',
            password: '1234567b',
            prevpassword: ['1234567a'],
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
            quizzes: [],
          }];
    const expectedList = users1.sort((a, b) => a.userId - b.userId);
    expect(result1).toStrictEqual(expectedList);
  });

  // more than one user and with adminUserDetailsUpdate, many times
  test('adminUserPasswordUpdate return type', () => {
    const id2 = adminAuthRegister('validemail2@gmail.com', '1234567a', 'Jennifer', 'Smith') as UserId;
    adminUserPasswordUpdate(id2.authUserId, '1234567a', '1234567b');
    adminUserPasswordUpdate(id2.authUserId, '1234567b', '1234567c');
    const result = usersList().sort((a, b) => a.userId - b.userId);
    const users: user[] =
          [{
            userId: data.authUserId,
            nameFirst: 'Jane',
            nameLast: 'Smith',
            email: 'validemail@gmail.com',
            password: '1234567a',
            prevpassword: [],
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
            quizzes: [],
          },
          {
            userId: id2.authUserId,
            nameFirst: 'Jennifer',
            nameLast: 'Smith',
            email: 'validemail2@gmail.com',
            password: '1234567c',
            prevpassword: ['1234567a', '1234567b'],
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
            quizzes: [],
          }];
    const expectedList = users.sort((a, b) => a.userId - b.userId);
    expect(result).toStrictEqual(expectedList);
  });
});
*/
