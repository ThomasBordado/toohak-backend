import { clear } from './other.js';
import { adminAuthRegister } from './auth.js';
import { getData } from './dataStore.js';

beforeEach(()=> {
    clear();
})

test('Test clear registered user', () => {
    expect(clear()).toStrictEqual({});
    let data = getData();
    expect(data).toMatchObject({users: [],quizzes: []});
    adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith');
    data = getData();
    expect(data).toMatchObject({users: [{userId: 1, nameFirst: 'Hayden', nameLast: 'Smith', email: 'hayden.smith@unsw.edu.au', password: 'password1', numSuccessfulLogins: 0, numFailedPasswordsSinceLastLogin: 0, quizzes: []}],quizzes: []});
    clear();
    data = getData();
    expect(data).toMatchObject({users: [],quizzes: []});
});

// Add a test to clear quizzes when we are able to make quizzes.
test.todo('Test clear quizzes');