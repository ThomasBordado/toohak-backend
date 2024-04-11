import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
import { IncomingHttpHeaders } from 'http';
import HTTPError from 'http-errors';
const SERVER_URL = `${url}:${port}`;

// interface RequestHelperReturnType {
//   statusCode?: number;
//   jsonBody?: Record<string, any>;
//   error?: string;
// }
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
  payload: object = {},
  headers: IncomingHttpHeaders = {}
) => {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, json, headers, timeout: 20000 });
  const bodyString = res.body.toString();
  let bodyObject;
  try {
    // Return if valid JSON, in our own custom format
    bodyObject = JSON.parse(bodyString);
  } catch (error) {
    if (res.statusCode === 200) {
      throw HTTPError(500,
        `Non-jsonifiable body despite code 200: '${res.body}'.\nCheck that you are not doing res.json(undefined) instead of res.json({}), e.g. in '/clear'`
      );
    }
    bodyObject = { error: `Failed to parse JSON: '${error.message}'` };
  }

  const errorMessage = `[${res.statusCode}] ` + bodyObject?.error || bodyObject || 'No message specified!';

  // NOTE: the error is rethrown in the test below. This is useful becasuse the
  // test suite will halt (stop) if there's an error, rather than carry on and
  // potentially failing on a different expect statement without useful outputs
  switch (res.statusCode) {
    case 400: // BAD_REQUEST
      throw HTTPError(res.statusCode, errorMessage);
    case 401: // UNAUTHORIZED
      throw HTTPError(res.statusCode, errorMessage);
    case 403: // BAD_REQUEST
      throw HTTPError(res.statusCode, errorMessage);
    case 404: // NOT_FOUND
      throw HTTPError(res.statusCode, `Cannot find '${SERVER_URL + path}' [${method}]\nReason: ${errorMessage}\n\nHint: Check that your server.ts have the correct path AND method`);
    case 500: // INTERNAL_SERVER_ERROR
      throw HTTPError(res.statusCode, errorMessage + '\n\nHint: Your server crashed. Check the server log!\n');
    default:
      if (res.statusCode !== 200) {
        throw HTTPError(res.statusCode, errorMessage + `\n\nSorry, no idea! Look up the status code ${res.statusCode} online!\n`);
      }
  }
  return bodyObject;
};

// ========================================================================= //

// Wrapper functions

export const requestQuizList = (token: string) => {
  return requestHelper('GET', '/v2/admin/quiz/list', {}, { token });
};

export const requestQuizCreate = (token: string, name: string, description: string) => {
  return requestHelper('POST', '/v2/admin/quiz', { name, description }, { token });
};

export const requestQuizTrash = (token: string, quizId: number) => {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizId}`, {}, { token });
};

export const requestQuizViewTrash = (token: string) => {
  return requestHelper('GET', '/v2/admin/quiz/trash', {}, { token });
};

export const requestQuizRestore = (token: string, quizId: number) => {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/restore`, {}, { token });
};

export const requestLogout = (token: string) => {
  return requestHelper('POST', '/v2/admin/auth/logout', {}, { token });
};

export const requestQuizTrashEmpty = (token: string, quizIds: string) => {
  return requestHelper('DELETE', '/v2/admin/quiz/trash/empty', { quizIds }, { token });
};
