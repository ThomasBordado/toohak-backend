import adminUserDetailsUpdate from './adminUserDetailsUpdate'
import {clear, adminAuthRegister} from "./auth.test";

beforeEach(()=> {
    clear();
    
});

// 1. Testing for errors
describe('adminUserDetailsUpdate', () => {
    test.todo('Test for adminUserDetailsUpdate return value, behavior and side effects');
    let data;
    beforeEach(() => {
        data = adminAuthRegister('validemail@gmail.com', '1234567a', 'Jane', 'Smith');
        data = adminAuthRegister('validemail2@gmail.com', '1234567b', 'John', 'Smith');
        data = adminAuthRegister('validemail3@gmail.com', '1234567c', 'Jack', 'Smith');
    });

    test.each([
        {test: 'invalid authUserId', authUserId: '-99', email: 'validemail@gmail.com', nameFirst: 'Jane', nameLast: 'Smith'},
        {test: 'invalid email', authUserId: '1', email: 'invalidemail', nameFirst: 'Jane', nameLast: 'Smith'},
        {test: 'invalid nameFirst(contain invalid characters)', authUserId: '1', email: 'validemail@gmail.com', nameFirst: 'J++', nameLast: 'Smith'},
        {test: 'invalid nameFirst(too short)', authUserId: '1', email: 'validemail@gmail.com', nameFirst: 'J', nameLast: 'Smith'},
        {test: 'invalid nameFirst(too long)', authUserId: '1', email: 'validemail@gmail.com', nameFirst: 'JaneJaneJaneJaneJaneJane', nameLast: 'Smith'},
        {test: 'invalid nameLast(contain invalid characters)', authUserId: '1', email: 'validemail@gmail.com', nameFirst: 'Jane', nameLast: 'S++'},
        {test: 'invalid nameLast(too short)', authUserId: '1', email: 'validemail@gmail.com', nameFirst: 'Jane', nameLast: 'S'},
        {test: 'invalid nameLast(too long)', authUserId: '1', email: 'validemail@gmail.com', nameFirst: 'Jane', nameLast: 'SmithSmithSmithSmithSmith'},

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
    adminUserDetailsUpdate('1', 'updateemail@gmail.com', 'Jennifer', 'Lawson');
    for (const user of data.user) {
        if (user.id === 1) {
            expect(viewEmail()).toStrictEqual({email: 'updateemail@gmail.com'});
            expect(viewNameFirst()).toStrictEqual({nameFirst: 'Jennifer'});
            expect(viewNameLast()).toStrictEqual({nameLast: 'Lawson'});
        }
    }
c
})