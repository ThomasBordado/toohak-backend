import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
import { quizQuestionCreateInput } from './interfaces';

const SERVER_URL = `${url}:${port}`;

interface RequestHelperReturnType {
  statusCode: number;
  jsonBody?: Record<string, any>;
  error?: string;
}
/**
 * Sends a request to the given route and return its results
 *
 * Errors will be returned in the form:
 *  { statusCode: number, error: string }
 *
 * Normal responses will be in the form
 *  { statusCode: number, jsonBody: object }
 *
 * This helper function was taken from week5-server-example
 * https://nw-syd-gitlab.cseunsw.tech/COMP1531/24T1/week5-server-example/-/blob/master/tests/wrapper.test.ts?ref_type=heads
 */
const requestHelper = (
  method: HttpVerb,
  path: string,
  payload: object = {}
): RequestHelperReturnType => {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, json, timeout: 20000 });
  const bodyString = res.body.toString();
  let bodyObject: RequestHelperReturnType;
  try {
    // Return if valid JSON, in our own custom format
    bodyObject = {
      jsonBody: JSON.parse(bodyString),
      statusCode: res.statusCode,
    };
  } catch (error: any) {
    bodyObject = {
      error: `\
Server responded with ${res.statusCode}, but body is not JSON!

GIVEN:
${bodyString}.

REASON:
${error.message}.

HINT:
Did you res.json(undefined)?`,
      statusCode: res.statusCode,
    };
  }
  if ('error' in bodyObject) {
    // Return the error in a custom structure for testing later
    return { statusCode: res.statusCode, error: bodyObject.error };
  }
  return bodyObject;
};

// ========================================================================= //

// Wrapper functions
export const requestRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  return requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });
};

export const requestLogin = (email: string, password: string) => {
  return requestHelper('POST', '/v1/admin/auth/login', { email, password });
};

export const requestGetUserDetails = (token: string) => {
  return requestHelper('GET', '/v1/admin/user/details', { token });
};

export const requestUpdateUserDetails = (token: string, email: string, nameFirst: string, nameLast: string) => {
  return requestHelper('PUT', '/v1/admin/user/details', { token, email, nameFirst, nameLast });
};

export const requestUpdatePassword = (token: string, oldPassword: string, newPassword: string) => {
  return requestHelper('PUT', '/v1/admin/user/password', { token, oldPassword, newPassword });
};

export const requestQuizList = (token: string) => {
  return requestHelper('GET', '/v1/admin/quiz/list', { token });
};

export const requestQuizCreate = (token: string, name: string, description: string) => {
  return requestHelper('POST', '/v1/admin/quiz', { token, name, description });
};

export const requestQuizTrash = (token: string, quizId: number) => {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, { token });
};

export const requestQuizInfo = (token: string, quizId: number) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}`, { token, quizId });
};

export const requestUpdateQuizName = (token: string, quizId: number, name: string) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/name`, { token, name, quizId });
};

export const requestUpdateQuizDescription = (token: string, quizId: number, description: string) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/description`, { token, quizId, description });
};

export const requestQuizTrashEmpty = (token: string, quizIds: string) => {
  return requestHelper('DELETE', '/v1/admin/quiz/trash/empty', { token, quizIds });
};

export const requestLogout = (token: string) => {
  return requestHelper('POST', '/v1/admin/auth/logout', { token });
};

export const requestQuizQuestionCreate = (token: string, questionBody: quizQuestionCreateInput, quizid: number) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizid}/question`, { token, questionBody, quizid });
};

export const requestquizTransfer = (token: string, userEmail: string, quizid: number) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizid}/transfer`, { token, userEmail });
};

export const requestClear = () => {
  return requestHelper('DELETE', '/v1/clear', {});
};

export const requestQuestionDuplicate = (token: string, quizid: number, questionid: number) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizid}/question/${questionid}/duplicate`, { token, quizid, questionid });
};

export const requestMoveQuestion = (token: string, quizId: number, questionId: number, newPosition: number) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}/move`, { token, quizId, questionId, newPosition });
};

export const requestUpdateQuizQuestion = (token: string, questionBody: quizQuestionCreateInput, quizid: number, questionid: number) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizid}/question/${questionid}`, { token, questionBody, quizid, questionid });
};

export const requestDeleteQuizQuestion = (token: string, quizid: number, questionid: number) => {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizid}/question/${questionid}`, { token, quizid, questionid });
};

export const requestQuizViewTrash = (token: string) => {
  return requestHelper('GET', '/v1/admin/quiz/trash', { token });
};

export const requestQuizRestore = (token: string, quizId: number) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/restore`, { token });
};
