import { adminAuthRegister, adminAuthLogin, adminUserDetails, adminUserDetailsUpdate, adminUserPasswordUpdate } from './auth.js';
import { clear } from './other.js';
import { getData } from './dataStore.js'

beforeEach(()=> {
    clear();
})

describe('Test successful adminAuthRegister', () => {

    // 1. Successful Register of two users
    test.skip('Test registering two users', () => {
        expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith')).toStrictEqual({authUserId: 1});
        expect(adminAuthRegister('thomas.bordado@unsw.edu.au', 'password2', 'Thomas', 'Bordado')).toStrictEqual({authUserId: 2});
    });
    
});

describe('Test unssuccessful adminAuthRegister', () => {

    // 1. Add an email and then try add the same email.
    test.skip('Test email in use adminAuthRegister', () => {
        let data = getData;
        console.log(data);
        expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith')).toStrictEqual({authUserId: 1});
        expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith')).toMatchObject({ error: expect.any(String) });
    });

    // 2. Provide an invlaid email.
    test.skip('Test invalid email adminAuthRegister', () => {
        expect(adminAuthRegister('hayden.smithson', 'password3', 'Hayden', 'Smith')).toMatchObject({ error: expect.any(String) });
    });

    // 3. Invalid Characters in First name.
    test.skip('Test first name invalid characters adminAuthRegister', () => {
        expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password3', 'Hayden!', 'Smithson')).toMatchObject({ error: expect.any(String) });
    });

    // 4. Invalid length of First name.
    test.skip('Test first name invalid length adminAuthRegister', () => {
        clear();
        expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password3', 'H', 'Smithson')).toMatchObject({ error: expect.any(String) });
    });

    // 5. Invalid Character in Last name.
    test.skip('Test last name invalid characters adminAuthRegister', () => {
        clear();
        expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password3', 'Hayden', 'Smithson!')).toMatchObject({ error: expect.any(String) });
    });

    // 6. Invalid length of Last name.
    test.skip('Test last name invalid length adminAuthRegister', () => {
        clear();
        expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password3', 'Hayden', 'S')).toMatchObject({ error: expect.any(String) });
    });

    // 7. Invalid password length.
    test.skip('Test password invalid length adminAuthRegister', () => {
        clear();
        expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'pass', 'Hayden', 'Smithson!')).toMatchObject({ error: expect.any(String) });
    });
    
    // 8. Invalid password conditions.
    test.skip('Test password invalid adminAuthRegister', () => {
        clear();
        expect(adminAuthRegister('hayden.smith@unsw.edu.au', 'password', 'Hayden', 'Smithson!')).toMatchObject({ error: expect.any(String) });
    });
});
