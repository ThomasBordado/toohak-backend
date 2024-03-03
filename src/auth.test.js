import { adminAuthRegister, adminAuthLogin, adminUserDetails, adminUserDetailsUpdate, adminUserPasswordUpdate } from './auth.js';
import { clear } from './other.js';

beforeEach(() => {
    clear();
})

describe('Test adminAuthRegister', () => {

    // 1. Successful Register of two users
    test('Test registering two users', () => {
        let user1 = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith');
        let user2 = adminAuthRegister('thomas.bordado@unsw.edu.au', 'password2', 'Thomas', 'Bordado');
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
        let result = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith');
        expect(adminAuthLogin('hayden.smith@unsw.edu.au', 'password1')).toStrictEqual(result);
    });

    // 2. Logging into an non-existing email then registering the email and logging in.
    test('Test email address does not exist', () => {
        expect(adminAuthLogin('thomas@gmail.com', 'password1')).toStrictEqual({ error: expect.any(String) });
        let result = adminAuthRegister('thomas@gmail.com', 'password1', 'Thomas', 'Bordado');
        expect(adminAuthLogin('thomas@gmail.com', 'password1')).toStrictEqual(result);
    });

    // 3. Incorrect Password for given email.
    test('Test incorrect password', () => {
        expect(adminAuthRegister('thomas@gmail.com', 'password1', 'Thomas', 'Bordado')).toStrictEqual({ authUserId: expect.any(Number) });
        expect(adminAuthLogin('thomas@gmail.com', 'password2')).toStrictEqual({ error: expect.any(String) });
    });

    test.todo('Add tests checking numSuccessfulLogins and numSuccessfulLogins and numFailedPasswordsSinceLastLogin is updated');
});


describe('Test adminUserDetails', () => {

    // 1. Succesful return of account details
    test('Test succesful get user details', () => {
        let result = adminUserDetails(adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith'));
        expect(result).toStrictEqual({ authUserId: expect.any(Number) });
        expect(result).toStrictEqual({ name: expect.any(String) });
        expect(result).toStrictEqual({ email: expect.any(String) });
        expect(result).toStrictEqual({ numSuccesLogin: expect.any(Number) });
        expect(result).toStrictEqual({ numFailPassword: expect.any(Number) });
    });

    // 2. Invalid authUserId
    test('Test Invalid User ID', () => {
        expect(adminUserDetails(adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith'))).toStrictEqual({ authUserId: expect.any(Number) });
        expect(adminUserDetails('helloworld')).toStrictEqual({ error: expect.any(String) });
    })
})