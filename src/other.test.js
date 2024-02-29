import { clear } from './other.js';
import { adminAuthRegister } from './auth.js';
import { getData } from './dataStore.js';

beforeEach(()=> {
    clear();
})

test('Test clear registered user', () => {
    expect(clear()).toStrictEqual({});
    let data = getData();
    expect(data).toStrictEqual({users: [], quizzes: [], userIdStore: 0, quizIdStore: 0});
    adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith');
    data = getData();
    expect(data).toStrictEqual({
        users: [{userId: 1, nameFirst: 'Hayden', nameLast: 'Smith', email: 'hayden.smith@unsw.edu.au', password: 'password1', numSuccessfulLogins: 0, numFailedPasswordsSinceLastLogin: 0, quizzes: []}], 
        quizzes: [], 
        userIdStore: 0, 
        quizIdStore: 0
    });
    clear();
    data = getData();
    expect(data).toStrictEqual({users: [], quizzes: [], userIdStore: 0, quizIdStore: 0});
});

// Add a test to clear quizzes when we are able to make quizzes.
test.todo('Test clear quizzes');