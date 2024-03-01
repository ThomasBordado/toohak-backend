import { clear } from './other.js';
import { adminAuthRegister, adminAuthLogin } from './auth.js';

beforeEach(()=> {
    clear();
})

test('Test clear registered user', () => {

    expect(clear()).toStrictEqual({});

    // Register a user
    let user = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'Hayden', 'Smith');
    expect(user).toStrictEqual({ authUserId: expect.any(Number) });

    // Login successfully
    expect(adminAuthLogin('hayden.smith@unsw.edu.au', 'password1')).toStrictEqual(user);

    // Clear registered users
    expect(clear()).toStrictEqual({});

    // Unsuccessful login
    expect(adminAuthLogin('hayden.smith@unsw.edu.au', 'password1')).toStrictEqual({ error: expect.any(String) });

});

// Add a test to clear quizzes when we are able to make quizzes.
test.todo('Test clear quizzes');