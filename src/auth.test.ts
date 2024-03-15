import { adminAuthRegister, adminAuthLogin, adminUserDetails, adminUserDetailsUpdate, adminUserPasswordUpdate } from './auth';
import { clear } from './other';
import { usersList } from './authUtil';
import { user } from './interfaces';

beforeEach(() => {
  clear();
});

describe('Test adminAuthRegister', () => {
  // 1. Successful Register of two users
  test('Test registering two users', () => {
    const user1: any = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith');
    const user2: any = adminAuthRegister('thomas.bordado@unsw.edu.au', 'password2', 'Thomas', 'Bordado');
    expect(user1).toStrictEqual({ authUserId: expect.any(Number) });
    expect(user2).toStrictEqual({ authUserId: expect.any(Number) });
    expect(user1.authUserId).not.toStrictEqual(user2.authUserId);
  });

  // 2. Add an email and then try add the same email.
  test('Test email in use adminAuthRegister', () => {
    expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith')).toStrictEqual({ authUserId: expect.any(Number) });
    expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith')).toStrictEqual({ error: expect.any(String) });
  });

  // 3. Provide an invlaid email.
  test('Test invalid email adminAuthRegister', () => {
    expect(adminAuthRegister('hayden.smithson', 'password3', 'Hayden', 'Smith')).toStrictEqual({ error: expect.any(String) });
  });

  // 4. Invalid Characters in First name.
  test('Test first name invalid characters adminAuthRegister', () => {
    expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password3', 'Hayden!', 'Smithson')).toStrictEqual({ error: expect.any(String) });
    expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password3', 'Hayden1', 'Smithson')).toStrictEqual({ error: expect.any(String) });
    expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password3', 'Hay?den', 'Smithson')).toStrictEqual({ error: expect.any(String) });
  });

  // 5. Invalid length of First name.
  test('Test first name invalid length adminAuthRegister', () => {
    expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password3', 'H', 'Smithson')).toStrictEqual({ error: expect.any(String) });
    expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password3', 'haydenhaydenhaydenhayden', 'Smithson')).toStrictEqual({ error: expect.any(String) });
  });

  // 6. Invalid Character in Last name.
  test('Test last name invalid characters adminAuthRegister', () => {
    expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password3', 'Hayden', 'Smithson!')).toStrictEqual({ error: expect.any(String) });
    expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password3', 'Hayden', 'Smithson1')).toStrictEqual({ error: expect.any(String) });
    expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password3', 'Hayden', '{Smith}')).toStrictEqual({ error: expect.any(String) });
  });

  // 7. Invalid length of Last name.
  test('Test last name invalid length adminAuthRegister', () => {
    expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password3', 'Hayden', 'S')).toStrictEqual({ error: expect.any(String) });
    expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password3', 'Hayden', 'SmithSmithSmithSmithSmith')).toStrictEqual({ error: expect.any(String) });
  });

  // 8. Invalid password length.
  test('Test password invalid length adminAuthRegister', () => {
    expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'pass', 'Hayden', 'Smithson!')).toStrictEqual({ error: expect.any(String) });
  });

  // 9. Invalid password conditions.
  test('Test password invalid adminAuthRegister', () => {
    expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password', 'Hayden', 'Smithson!')).toStrictEqual({ error: expect.any(String) });
    expect(adminAuthRegister('hayden.smith@unsw.edu.au', '12345678', 'Hayden', 'Smithson!')).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Test adminAuthLogin', () => {
  // 1. Successful login to an existing account.
  test('Test successful login', () => {
    const result = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith');
    expect(adminAuthLogin('hayden.smith@unsw.edu.au', 'password1')).toStrictEqual(result);
  });

  // 2. Logging into an non-existing email then registering the email and logging in.
  test('Test email address does not exist', () => {
    expect(adminAuthLogin('thomas@gmail.com', 'password1')).toStrictEqual({ error: expect.any(String) });
    const result = adminAuthRegister('thomas@gmail.com', 'password1', 'Thomas', 'Bordado');
    expect(adminAuthLogin('thomas@gmail.com', 'password1')).toStrictEqual(result);
  });

  // 3. Incorrect Password for given email.
  test('Test incorrect password', () => {
    expect(adminAuthRegister('thomas@gmail.com', 'password1', 'Thomas', 'Bordado')).toStrictEqual({ authUserId: expect.any(Number) });
    expect(adminAuthLogin('thomas@gmail.com', 'password2')).toStrictEqual({ error: expect.any(String) });
  });

  test('Test numSuccessfulLogins and numFailedPasswordsSinceLastLogin', () => {
    // Register a user Hayden Smith
    const user: any = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith');
    // Get details of Hayden
    let details: any = adminUserDetails(user.authUserId);
    // Check that he has only logged in once and had no fails
    expect(details.user.numSuccessfulLogins).toStrictEqual(1);
    expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    // Login to hayden
    adminAuthLogin('hayden.smith@unsw.edu.au', 'password1');
    details = adminUserDetails(user.authUserId);
    // Number of logins increase
    expect(details.user.numSuccessfulLogins).toStrictEqual(2);
    expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    // Fail a login
    adminAuthLogin('hayden.smith@unsw.edu.au', 'password2');
    details = adminUserDetails(user.authUserId);
    // Number of failed logins increase
    expect(details.user.numSuccessfulLogins).toStrictEqual(2);
    expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
    // Login correctly
    adminAuthLogin('hayden.smith@unsw.edu.au', 'password1');
    details = adminUserDetails(user.authUserId);
    // Number of failed logins resets to 0
    expect(details.user.numSuccessfulLogins).toStrictEqual(3);
    expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
  });
});

describe('Test adminUserDetails', () => {
  // 1. Succesful return of account details
  test('Test succesful get user details', () => {
    const user1: any = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith');
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
    const user1: any = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith');
    expect(adminUserDetails(user1.authUserId + 1)).toStrictEqual({ error: expect.any(String) });
  });
});

/**
 * Test for adminUserDetailsUpdate
 */

describe('adminUserDetailsUpdate', () => {
  let data: any;
  beforeEach(() => {
    data = adminAuthRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith');
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
    const id2: any = adminAuthRegister('validemail2@gmail.com', '1234567a', 'Jane', 'Smith');
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
    const id2: any = adminAuthRegister('validemail2@gmail.com', '1234567a', 'Jane', 'Smith');
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

/**
 * Test for user password update
 */

describe('adminUserPasswordUpdate', () => {
  let data: any;
  beforeEach(() => {
    data = adminAuthRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith');
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
    const id2:any = adminAuthRegister('validemail2@gmail.com', '1234567a', 'Jennifer', 'Smith');
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
