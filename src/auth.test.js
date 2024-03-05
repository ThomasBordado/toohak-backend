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




describe('Test adminAuthLogin', () => {

    // 1. Successful login to an existing account.
    test('Test successful login', () => {
        let result = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith');
        expect(adminAuthLogin('hayden.smith@unsw.edu.au', 'password1')).toStrictEqual(result);
    });

    // 2. Logging into an non-existing email then registering the email and logging in.
    test('Test email address does not exist', () => {
        expect(adminAuthLogin('thomas@gmail.com', 'password1')).toStrictEqual({error: expect.any(String)});
        let result = adminAuthRegister('thomas@gmail.com', 'password1', 'Thomas', 'Bordado');
        expect(adminAuthLogin('thomas@gmail.com', 'password1')).toStrictEqual(result);
    });

    // 3. Incorrect Password for given email.
    test('Test incorrect password', () => {
        expect(adminAuthRegister('thomas@gmail.com', 'password1', 'Thomas', 'Bordado')).toStrictEqual({ authUserId: expect.any(Number) });
        expect(adminAuthLogin('thomas@gmail.com', 'password2')).toStrictEqual({error: expect.any(String)});
    });

    test.todo('Add tests checking numSuccessfulLogins and numSuccessfulLogins and numFailedPasswordsSinceLastLogin is updated');
});

/**
 * Test for adminUserDetailsUpdate
 */
import {usersList} from './authUtil.js'
beforeEach(()=> {
    clear();
    
});


describe('adminUserDetailsUpdate', () => {
    let data;
    beforeEach(() => {
    });

    test.each([
        data = adminAuthRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith'),
        {test: 'invalid authUserId', authUserId: data.authUserId + 1, email: 'validemail@gmail.com', nameFirst: 'Jane', nameLast: 'Smith'},
        {test: 'invalid authUserId', authUserId: data.authUserId + 99, email: 'validemail@gmail.com', nameFirst: 'Jane', nameLast: 'Smith'},
        {test: 'invalid email', authUserId: data.authUserId, email: 'invalidemail', nameFirst: 'Jane', nameLast: 'Smith'},
        {test: 'invalid nameFirst(contain invalid characters)', authUserId: data.authUserId, email: 'validemail@gmail.com', nameFirst: 'J++', nameLast: 'Smith'},
        {test: 'invalid nameFirst(too short)', authUserId: data.authUserId, email: 'validemail@gmail.com', nameFirst: 'J', nameLast: 'Smith'},
        {test: 'invalid nameFirst(too long)', authUserId: data.authUserId, email: 'validemail@gmail.com', nameFirst: 'JaneJaneJaneJaneJaneJane', nameLast: 'Smith'},
        {test: 'invalid nameLast(contain invalid characters)', authUserId: data.authUserId, email: 'validemail@gmail.com', nameFirst: 'Jane', nameLast: 'S++'},
        {test: 'invalid nameLast(too short)', authUserId: data.authUserId, email: 'validemail@gmail.com', nameFirst: 'Jane', nameLast: 'S'},
        {test: 'invalid nameLast(too long)', authUserId: data.authUserId, email: 'validemail@gmail.com', nameFirst: 'Jane', nameLast: 'SmithSmithSmithSmithSmith'},

    ]) ("adminUserDetailsUpdate error: '$test'", ({authUserId, email, nameFirst, nameLast}) => {
        expect(adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast)).toStrictEqual({error: expect.any(String)});
    })
});

// 2. Testing for return value
test('adminUserDetailsUpdate return type', () => {
    clear();
    let data = adminAuthRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith');
    expect(adminUserDetailsUpdate(data.authUserId, 'validemail1@gmail.com', 'Jane', 'Smith')).toStrictEqual({});

})

// 3. Testing for behaviors
//one user
test('adminUserDetailsUpdate return type', () => {          
    clear();
    let id1 = adminAuthRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith');
    adminUserDetailsUpdate(id1.authUserId, 'validemail1@gmail.com', 'Jennifer', 'Lawson');
    let result = usersList().sort((a, b) => a.userId - b.userId)
    let users =[
        {userId: id1.authUserId, 
        nameFirst: 'Jennifer', 
        nameLast: 'Lawson', 
        email: 'validemail1@gmail.com', 
        password: '1234567a', 
        prevpassword: [], 
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
        quizzes: [],
        }
    ]
    let expectedList = users.sort((a, b) => a.userId - b.userId);
    expect(result).toStrictEqual(expectedList);
})
//more than one user
test('adminUserDetailsUpdate return type', () => {
    clear();
    let id1 = adminAuthRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith');
    let id2 = adminAuthRegister('validemail2@gmail.com', '1234567a', 'Jane', 'Smith');
    adminUserDetailsUpdate(id2.authUserId, 'validemail1@gmail.com', 'Jennifer', 'Lawson');
    let result = usersList().sort((a, b) => a.userId - b.userId)
    let users =
        [{userId: id1.authUserId, 
        nameFirst: 'Jane', 
        nameLast: 'Smith', 
        email: 'validemail@gmail.com', 
        password: '1234567a', 
        prevpassword: [], 
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
        quizzes: [],
  }, {userId: id2.authUserId, 
    nameFirst: 'Jennifer', 
    nameLast: 'Lawson', 
    email: 'validemail1@gmail.com', 
    password: '1234567a', 
    prevpassword: [], 
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    quizzes: [],
}];
    let expectedList = users.sort((a, b) => a.userId - b.userId);
    expect(result).toStrictEqual(expectedList);

})




/**
 * Test for user password update
 */
beforeEach(()=> {
    clear();
    
});


describe('adminUserPasswordUpdate', () => {
    let data;
    beforeEach(() => {
        clear();
    });

    test.each([
        data = adminAuthRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith'),
        {test: 'invalid authUserId', authUserId: data.authUserId + 1, oldPassword: '1234567a', newPassword: '1234567b'},
        {test: 'invalid authUserId', authUserId: data.authUserId + 99, oldPassword: '1234567a', newPassword: '1234567b'},
        {test: 'old password incorrect', authUserId: data.authUserId,oldPassword: '1234567b', newPassword: '1234567c'},
        {test: 'Old Password and New Password match exactly', oldPassword: '1234567a', newPassword: '1234567a'},
        {test: 'New password not valid(too short)', authUserId: data.authUserId, oldPassword: '1234567a', newPassword: '123'},
        {test: 'New password not valid(does not contain letter)', authUserId: data.authUserId,oldPassword: '1234567a', newPassword: '12345678'},
        {test: 'New password not valid(does not contain number)', authUserId: data.authUserId, oldPassword: '1234567a', newPassword: 'abcdefgh'},

    ]) ("adminUserPasswordUpdate error: '$test'", ({authUserId, oldPassword, newPassword}) => {
        expect(adminUserPasswordUpdate(authUserId, oldPassword, newPassword)).toStrictEqual({error: expect.any(String)});
    })
});

// 2. Testing for return value
test('adminUserPasswordUpdate return type', () => {
    clear();
    let data = adminAuthRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith');
    expect(adminUserPasswordUpdate(data.authUserId, '1234567a', '1234567b')).toStrictEqual({});

})

// 3. Testing for behaviors
//one user
test('adminUserPasswordUpdate return type', () => {          
    clear();
    let id1 = adminAuthRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith');
    adminUserPasswordUpdate(id1.authUserId, '1234567a', '1234567b');
    let result1 = usersList().sort((a, b) => a.userId - b.userId)
    let users1 =
        [{userId: id1.authUserId, 
        nameFirst: 'Jane', 
        nameLast: 'Smith', 
        email: 'validemail@gmail.com', 
        password: '1234567b', 
        prevpassword: ['1234567a'], 
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
        quizzes: [],
    }];
    let expectedList = users1.sort((a, b) => a.userId - b.userId);
    expect(result1).toStrictEqual(expectedList);

})
//more than one user and with adminUserDetailsUpdate, many times
test('adminUserPasswordUpdate return type', () => {
    clear();
    let id1 = adminAuthRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith');
    let id2 = adminAuthRegister('validemail2@gmail.com', '1234567a', 'Jennifer', 'Smith');
    adminUserPasswordUpdate(id2.authUserId, '1234567a', '1234567b');
    adminUserPasswordUpdate(id2.authUserId, '1234567b', '1234567c');
    let result = usersList().sort((a, b) => a.userId - b.userId)
    let users =
        [{userId: id1.authUserId, 
        nameFirst: 'Jane', 
        nameLast: 'Smith', 
        email: 'validemail@gmail.com', 
        password: '1234567a', 
        prevpassword: [], 
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
        quizzes: [],
  }, {userId: id2.authUserId, 
    nameFirst: 'Jennifer', 
    nameLast: 'Smith', 
    email: 'validemail2@gmail.com', 
    password: '1234567c', 
    prevpassword: ['1234567a', '1234567b'], 
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    quizzes: [],
    }];
    let expectedList = users.sort((a, b) => a.userId - b.userId);
    expect(result).toStrictEqual(expectedList);


})
