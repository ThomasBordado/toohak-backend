import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

describe('Testing Post /v1/admin/quiz/{quizid}/transfer', () => {
  test('Correct status code and return value', () => {
    const adminAuthRegisterResponse1 = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: { email: '', password: '', nameFirst: '', nameLast: '' }
      });
    const adminAuthRegisterJson1 = JSON.parse(adminAuthRegisterResponse1.body.toString());
    
    request('POST', `/v1/admin/auth/logout`, {
      json: { token: adminAuthRegisterJson1.token }
    });

    const adminAuthRegisterResponse2 = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
      json: { email: '', password: '', nameFirst: '', nameLast: '' }
    });
  const adminAuthRegisterJson2 = JSON.parse(adminAuthRegisterResponse2.body.toString());

    const adminQuizCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`, {
      json: { token: '', name: '', description: '' }
    });
    const adminQuizCreateJson = JSON.parse(adminQuizCreateResponse.body.toString());

    const quizTransferResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/${adminQuizCreateJson.quizid}/transfer`, {
      json: {
        tokem: adminAuthRegisterJson2.token,
        userEmail: ''
      }
    });
    const quizTransferJson = JSON.parse(quizTransferResponse.body.toString());
    expect(quizTransferResponse.statusCode).toStrictEqual(200);
    expect(quizTransferJson).toStrictEqual({ });
  });

  test('Error test for 400 error', () => {

    const adminAuthRegisterResponse1 = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
      json: { email: '', password: '', nameFirst: '', nameLast: '' }
    });
    const adminAuthRegisterJson1 = JSON.parse(adminAuthRegisterResponse1.body.toString());

    request('POST', `/v1/admin/auth/logout`, {
      json: { token: adminAuthRegisterJson1.token }
    });

    const adminAuthRegisterResponse2 = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
      json: { email: '', password: '', nameFirst: '', nameLast: '' }
    });
    const adminAuthRegisterJson2 = JSON.parse(adminAuthRegisterResponse2.body.toString());

    const adminQuizCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`, {
      json: { token: '', name: '', description: '' }
    });
    const adminQuizCreateJson = JSON.parse(adminQuizCreateResponse.body.toString());

    test.each([
      {
        token: adminAuthRegisterJson2.token,
        userEmaill: '11111@qq.com'    // userEmail is not a real user
      },
      {
        token: adminAuthRegisterJson2.token,
        userEmaill: ''                // userEmail is the current logged in user
      },
      {
        token: adminAuthRegisterJson2.token,
        userEmaill: ''                // Quiz ID refers to a quiz that has a name that is already used by the target user
      },
      {
        token: adminAuthRegisterJson2.token,
        userEmaill: ''                // Any session for this quiz is not in END state
      },
    ])(
      'Error with token="$token", userEmail=$userEmail"',
      ({ token, userEmaill }) => {
        const quizTransfereResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/${adminQuizCreateJson.quizid}/transfer`, {
          json: { token, userEmaill }
        });
        expect(quizTransfereResponse.statusCode).toStrictEqual(400);
        const quizTransfereJson = JSON.parse(quizTransfereResponse.body.toString());
        expect(quizTransfereJson).toStrictEqual({ error: expect.any(String) });
      });
  });

  test('Error test for 401 error', () => {
    request('DELETE', `${SERVER_URL}/v1/clear`, {
      qs: { }
    });


  const adminAuthRegisterResponse1 = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
    json: { email: '', password: '', nameFirst: '', nameLast: '' }
  });
  const adminAuthRegisterJson1 = JSON.parse(adminAuthRegisterResponse1.body.toString());

  request('POST', `/v1/admin/auth/logout`, {
    json: { token: adminAuthRegisterJson1.token }
  });

  const adminAuthRegisterResponse2 = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
    json: { email: '', password: '', nameFirst: '', nameLast: '' }
  });
  const adminAuthRegisterJson2 = JSON.parse(adminAuthRegisterResponse2.body.toString());

  const adminQuizCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`, {
    json: { token: '', name: '', description: '' }
  });
  const adminQuizCreateJson = JSON.parse(adminQuizCreateResponse.body.toString());

  test.each([
    {
      token: '',
      userEmaill: '11111@qq.com'    // 	Token is empty
    },
    {
      token: '',
      userEmaill: ''                // 	Token is invalid (does not refer to valid logged in user session)
    },
  ])(
    'Error with token="$token"',
    ({ token, userEmaill }) => {
      const quizTransfereResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/${adminQuizCreateJson.quizid}/transfer`, {
        json: { token, userEmaill }
      });
      expect(quizTransfereResponse.statusCode).toStrictEqual(401);
      const quizTransfereJson = JSON.parse(quizTransfereResponse.body.toString());
      expect(quizTransfereJson).toStrictEqual({ error: expect.any(String) });
    });
  });

  test('Error test for 403 error, Valid token is provided, but user is not an owner of this quiz', () => {
    const adminAuthRegisterResponse1 = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: { email: '', password: '', nameFirst: '', nameLast: '' }
      });
    const adminAuthRegisterJson1 = JSON.parse(adminAuthRegisterResponse1.body.toString());
    
    request('POST', `/v1/admin/auth/logout`, {
      json: { token: adminAuthRegisterJson1.token }
    });

    const adminAuthRegisterResponse2 = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
      json: { email: '', password: '', nameFirst: '', nameLast: '' }
    });
  const adminAuthRegisterJson2 = JSON.parse(adminAuthRegisterResponse2.body.toString());

    const adminQuizCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`, {
      json: { token: '', name: '', description: '' }
    });
    const adminQuizCreateJson = JSON.parse(adminQuizCreateResponse.body.toString());

    const quizTransferResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/${adminQuizCreateJson.quizid}/transfer`, {
      json: {
        tokem: '',
        userEmail: ''
      }
    });
    const quizTransferJson = JSON.parse(quizTransferResponse.body.toString());
    expect(quizTransferResponse.statusCode).toStrictEqual(403);
    expect(quizTransferJson).toStrictEqual({ error: expect.any(String) });
  });

});
