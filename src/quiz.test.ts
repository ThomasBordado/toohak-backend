import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

describe('Testing Post /v1/admin/quiz/{quizid}/question', () => {
  test('Correct status code and return value', () => {
    const adminAuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: { email: '', password: '', nameFirst: '', nameLast: '' }
      });
    const adminAuthRegisterJson = JSON.parse(adminAuthRegisterResponse.body.toString());

    const adminQuizCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`, {
      json: { token: '', name: '', description: '' }
    });
    const adminQuizCreateJson = JSON.parse(adminQuizCreateResponse.body.toString());

    const quizQuestionCreatResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/${adminQuizCreateJson.quizId}/question`, {
      json: {
        token: 23748,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
            answer: 'Prince Charles',
            correct: true
            },
            {
              answer: 'Prince Charles.',
              correct: true
            }
          ]
        }
      }
    });
    const quizQuestionCreatJson = JSON.parse(quizQuestionCreatResponse.body.toString());
    expect(quizQuestionCreatResponse.statusCode).toStrictEqual(200);
    expect(quizQuestionCreatJson).toStrictEqual({ quizQuestionCreatJson.questionId });
  });

  test('Error test for 400 error', () => {

    const adminAuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
      json: { email: '', password: '', nameFirst: '', nameLast: '' }
    });
    const adminAuthRegisterJson = JSON.parse(adminAuthRegisterResponse.body.toString());

    const adminQuizCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`, {
      json: { token: '', name: '', description: '' }
    });
    const adminQuizCreateJson = JSON.parse(adminQuizCreateResponse.body.toString());

    test.each([
      {                               // Question string is less than 5 characters in length
        token: 23748,
        questionBody: {
          question: 'd?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true
            },
            {
              answer: 'Prince Charles.',
              correct: true
            }
          ]
        }
      },
      {
        token: 23748,                  // Question string is greater than 50 characters
        questionBody: {
          question: 'Who is the Monarch of England???????????????????????????????????????????????????????????????????',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true
            },
            {
              answer: 'Prince Charles.',
              correct: true
            }
          ]
        }
      },
      {                                // Question has more than 6 answers
        token: 23748,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles1',
              correct: true
            },
            {
              answer: 'Prince Charles2',
              correct: true
            },
            {
              answer: 'Prince Charles3',
              correct: true
            },
            {
              answer: 'Prince Charles4',
              correct: true
            },
            {
              answer: 'Prince Charles5',
              correct: true
            },
            {
              answer: 'Prince Charles6',
              correct: true
            },
            {
              answer: 'Prince Charles7',
              correct: true
            },
          ]
        }
      },
      {                                     // Question has less than 2 answers
        token: 23748,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true
            }
          ]
        }
      },
      {                                       // The question duration is not a positive number
        token: 23748,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: -1,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true
            },
            {
              answer: 'Prince Charles.',
              correct: true
            }
          ]
        }
      },
      {
        token: 23748,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 181,                      // The sum of the question durations in the quiz exceeds 3 minutes(one question)
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true
            },
            {
              answer: 'Prince Charles.',
              correct: true
            }
          ]
        }
      },
      {
        token: 23748,
        questionBody: {                       // The points is less than 1
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 0,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true
            }
          ]
        }
      },
      {
        token: 23748,
        questionBody: {                      // The point is larger than 10
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 15,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true
            }
          ]
        }
      },
      {
        token: 23748,
        questionBody: {                       // Answer is shorter than 1 charactor
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: '',
              correct: true
            },
            {
              answer: 'Prince Charles',
              correct: true
            }
          ]
        }
      },
      {                                        // Answer is longer than 30 charactors
        token: 23748,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
              correct: true
            },
            {
              answer: 'Prince Charles.',
              correct: true
            }
          ]
        }
      },
      {                                           // One answer is  duplicates of one another (within the same question)
        token: 23748,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true
            },
            {
              answer: 'Prince Charles',
              correct: true
            }
          ]
        }
      },
      {
        token: 23748,
        questionBody: {                           // There are no correct answers
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Louis XVI',
              correct: false
            },
            {
              answer: 'Prince Charles.',
              correct: true
            }
          ]
        }
      }
    ])(
      'Error with token="$token", userEmail=$userEmail"',
      ({ token, questionBody }) => {
        const quizQuestionCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/${adminQuizCreateJson.questionId}/question`, {
          json: { token, questionBody }
        });
        expect(quizQuestionCreateResponse.statusCode).toStrictEqual(400);
        const quizQuestionCreateJson = JSON.parse(quizQuestionCreateResponse.body.toString());
        expect(quizQuestionCreateJson).toStrictEqual({ error: expect.any(String) });
      });
  });

  test('Error test for 401 error', () => {
    request('DELETE', `${SERVER_URL}/v1/clear`, {
      qs: { }
    });


  const adminAuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
    json: { email: '', password: '', nameFirst: '', nameLast: '' }
  });
  const adminAuthRegisterJson = JSON.parse(adminAuthRegisterResponse.body.toString());

  const adminQuizCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`, {
    json: { token: '', name: '', description: '' }
  });
  const adminQuizCreateJson = JSON.parse(adminQuizCreateResponse.body.toString());

  test.each([
    {
      token: '',
      quizQuestion: {                                               // 	Token is empty
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true
            },
            {
              answer: 'Prince Charles.',
              correct: true
            }
          ]
        }
      }
    },
    {
      token: '',
      quizQuestion: {                                               // 	Token is invalid
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true
            },
            {
              answer: 'Prince Charles.',
              correct: true
            }
          ]
        }
      }
    },
  ])(
    'Error with token="$token"',
    ({ token, quizQuestion }) => {
      const quizQuestionCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/${adminQuizCreateJson.quizid}/transfer`, {
        json: { token, quizQuestion }
      });
      expect(quizQuestionCreateResponse.statusCode).toStrictEqual(401);
      const quizQuestionCreateJson = JSON.parse(quizQuestionCreateResponse.body.toString());
      expect(quizQuestionCreateJson).toStrictEqual({ error: expect.any(String) });
    });
  });

  test('Error test for 403 error, Valid token is provided, but user is not an owner of this quiz', () => {
    const adminAuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: { email: '', password: '', nameFirst: '', nameLast: '' }
      });
    const adminAuthRegisterJson = JSON.parse(adminAuthRegisterResponse.body.toString());

    const adminQuizCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`, {
      json: { token: '', name: '', description: '' }
    });
    const adminQuizCreateJson = JSON.parse(adminQuizCreateResponse.body.toString());

    const quizQuestionCreatResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/${adminQuizCreateJson.quizid}/transfer`, {
      json: {
        token: adminAuthRegisterJson.token + 1,
        quizQuestion: {                                               // 	Token is invalid
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: 'Prince Charles',
                correct: true
              },
              {
                answer: 'Prince Charles.',
                correct: true
              }
            ]
          }
        }
      }
    });
    const quizQuestionCreatJson = JSON.parse(quizQuestionCreatResponse.body.toString());
    expect(quizQuestionCreatResponse.statusCode).toStrictEqual(403);
    expect(quizQuestionCreatJson).toStrictEqual({ error: expect.any(String) });
  });

});
