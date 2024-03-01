console.log(data);

import { adminAuthRegister, adminAuthLogin, adminUserDetails, adminUserDetailsUpdate, adminUserPasswordUpdate } from './auth.js';
import { clear } from './other.js';

beforeEach(()=> {
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



/**
 * Test for adminUserDetailsUpdate
 */
beforeEach(()=> {
    clear();
    
});


describe('adminUserDetailsUpdate', () => {
    test.todo('Test for adminUserDetailsUpdate return value, behavior and side effects');
    let data;
    beforeEach(() => {
        data = adminAuthRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith');
    });

    test.each([
        {test: 'invalid authUserId', authUserId: -99, email: 'validemail@gmail.com', nameFirst: 'Jane', nameLast: 'Smith'},
        {test: 'invalid authUserId', authUserId: 999, email: 'validemail@gmail.com', nameFirst: 'Jane', nameLast: 'Smith'},
        {test: 'invalid email', authUserId: 1, email: 'invalidemail', nameFirst: 'Jane', nameLast: 'Smith'},
        {test: 'invalid nameFirst(contain invalid characters)', authUserId: 1, email: 'validemail@gmail.com', nameFirst: 'J++', nameLast: 'Smith'},
        {test: 'invalid nameFirst(too short)', authUserId: 1, email: 'validemail@gmail.com', nameFirst: 'J', nameLast: 'Smith'},
        {test: 'invalid nameFirst(too long)', authUserId: 1, email: 'validemail@gmail.com', nameFirst: 'JaneJaneJaneJaneJaneJane', nameLast: 'Smith'},
        {test: 'invalid nameLast(contain invalid characters)', authUserId: 1, email: 'validemail@gmail.com', nameFirst: 'Jane', nameLast: 'S++'},
        {test: 'invalid nameLast(too short)', authUserId: 1, email: 'validemail@gmail.com', nameFirst: 'Jane', nameLast: 'S'},
        {test: 'invalid nameLast(too long)', authUserId: 1, email: 'validemail@gmail.com', nameFirst: 'Jane', nameLast: 'SmithSmithSmithSmithSmith'},

    ]) ("adminUserDetailsUpdate error: '$test'", ({authUserId, email, nameFirst, nameLast}) => {
        expect(adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast)).toStrictEqual({error: expect.any(String)});
    })
});

// 2. Testing for return value
test('adminUserDetailsUpdate return type', () => {
    expect(adminUserDetailsUpdate(1, 'validemail@gmail.com', 'Jane', 'Smith')).toStrictEqual({});

})

// 3. Testing for behaviors
test('adminUserUpdate behavior: update the userdetails', () => {
    adminUserDetailsUpdate(1, 'updateemail@gmail.com', 'Jennifer', 'Lawson');
    expect(data.users.email).toStrictEqual({email: 'updateemail@gmail.com'});
    expect(data.users.nameFirst).toStrictEqual({nameFirst: 'Jennifer'});
    expect(data.users.nameLast).toStrictEqual({nameLast: 'Lawson'});


})