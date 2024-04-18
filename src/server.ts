import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { clear } from './other';
<<<<<<< HEAD
import { adminQuizList, adminQuizCreate1, adminQuizCreate2, adminQuizRemove, adminQuizInfo, adminQuizNameUpdate, adminQuizDescriptionUpdate, adminQuizViewTrash, adminQuizRestore, adminQuizTrashEmpty, quizTransfer1, quizTransfer2, adminQuizQuestionUpdate, adminQuizQuestionDelete, adminQuizQuestionMove, adminQuizQuestionDuplicate, quizQuestionCreate2, quizQuestionCreate1, adminQuizThumbnailUpdate, sessionSendMessage, sessionMessagesList } from './quiz';
=======
import { adminQuizList, adminQuizCreate1, adminQuizCreate2, adminQuizRemove, adminQuizInfo, adminQuizNameUpdate, adminQuizDescriptionUpdate, adminQuizViewTrash, adminQuizRestore, adminQuizTrashEmpty, quizTransfer1, quizTransfer2, adminQuizQuestionUpdate, adminQuizQuestionDelete, adminQuizQuestionMove, adminQuizQuestionDuplicate, quizQuestionCreate2, quizQuestionCreate1, adminQuizThumbnailUpdate, viewSessions, sessionStart } from './quiz';
>>>>>>> master
import { adminAuthLogin, adminAuthRegister, adminUserDetails, adminUserDetailsUpdate2, adminUserPasswordUpdate2, adminAuthLogout, adminUserDetailsUpdate1, adminUserPasswordUpdate1 } from './auth';
import { loadData, saveData } from './persistence';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other dosmains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const response = adminAuthRegister(email, password, nameFirst, nameLast);
  res.json(response);
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const response = adminAuthLogin(email, password);
  res.json(response);
});

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const response = adminUserDetails(token);
  if ('error' in response) {
    return res.status(401).json(response);
  }
  res.json(response);
});

app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const response = adminUserDetails(token);
  res.json(response);
});

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.body.token as string;
  const { email, nameFirst, nameLast } = req.body;
  const response = adminUserDetailsUpdate1(token, email, nameFirst, nameLast);

  if ('error' in response) {
    if (response.error === 'Token is empty or invalid') {
      return res.status(401).json(response);
    }
    return res.status(400).json(response);
  }
  return res.json(response);
});

app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { email, nameFirst, nameLast } = req.body;
  const response = adminUserDetailsUpdate2(token, email, nameFirst, nameLast);
  res.json(response);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const token = req.body.token as string;
  const { oldPassword, newPassword } = req.body;
  const response = adminUserPasswordUpdate1(token, oldPassword, newPassword);

  if ('error' in response) {
    if (response.error === 'Token is empty or invalid') {
      return res.status(401).json(response);
    }
    return res.status(400).json(response);
  }
  return res.json(response);
});

app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { oldPassword, newPassword } = req.body;
  const response = adminUserPasswordUpdate2(token, oldPassword, newPassword);
  res.json(response);
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.body.token as string;
  const response = adminAuthLogout(token);
  res.json(response);
});

app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const response = adminAuthLogout(token);
  res.json(response);
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminQuizList(token);
  if ('error' in result) {
    return res.status(401).json(result);
  }
  res.json(result);
});

app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const result = adminQuizList(token);
  res.json(result);
});

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  // Everything in req.body will be of the correct type
  const token = req.body.token as string;
  const { name, description } = req.body;
  const result = adminQuizCreate1(token, name, description);
  if ('error' in result) {
    if (result.error.localeCompare('Token is empty or invalid') === 0) {
      return res.status(401).json(result);
    }
    return res.status(400).json(result);
  }
  res.json(result);
});

app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  // Everything in req.body will be of the correct type
  const token = req.headers.token as string;
  const { name, description } = req.body;
  const result = adminQuizCreate2(token, name, description);
  res.json(result);
});

app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminQuizViewTrash(token);
  if ('error' in result) {
    return res.status(401).json(result);
  }
  res.json(result);
});

app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const result = adminQuizViewTrash(token);
  res.json(result);
});

app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  // Everything in req.body will be of the correct type
  const quizId = parseInt(req.params.quizid as string);
  const token = req.body.token as string;
  const { description } = req.body;
  const result = adminQuizDescriptionUpdate(token, quizId, description);
  if ('error' in result) {
    if (result.error.localeCompare('Token is empty or invalid') === 0) {
      return res.status(401).json(result);
    } else if (result.error.localeCompare('Invalid quizId') === 0 || result.error.localeCompare('User does not own this quiz') === 0) {
      return res.status(403).json(result);
    }
    return res.status(400).json(result);
  }
  res.json(result);
});

app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  // Everything in req.body will be of the correct type
  const quizId = parseInt(req.params.quizid as string);
  const token = req.headers.token as string;
  const { description } = req.body;
  const result = adminQuizDescriptionUpdate(token, quizId, description);

  res.json(result);
});

app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizId = parseInt(req.params.quizid as string);
  const result = adminQuizRemove(token, quizId);
  if ('error' in result) {
    if (result.error.localeCompare('Token is empty or invalid') === 0) {
      return res.status(401).json(result);
    }
    return res.status(403).json(result);
  }
  res.json(result);
});

app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid as string);
  const result = adminQuizRemove(token, quizId);
  res.json(result);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const token = req.body.token as string;
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const newPosition = req.body.newPosition as number;
  const result = adminQuizQuestionMove(token, quizId, questionId, newPosition);

  if ('error' in result) {
    if (result.error.localeCompare('Token is empty or invalid') === 0) {
      return res.status(401).json(result);
    } else if (result.error.localeCompare('Invalid quiz ID') === 0 ||
      result.error.localeCompare('User does not own this quiz') === 0) {
      return res.status(403).json(result);
    }
    return res.status(400).json(result);
  }
  res.json(result);
});

app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const newPosition = req.body.newPosition as number;
  const result = adminQuizQuestionMove(token, quizId, questionId, newPosition);

  res.json(result);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const token = req.body.token as string;
  const { questionBody } = req.body;
  const response = adminQuizQuestionUpdate(token, questionBody, quizId, questionId);
  if ('error' in response) {
    if (response.error.localeCompare('Token is empty or invalid') === 0) {
      return res.status(401).json(response);
    } else if (response.error.localeCompare('Invalid quizId') === 0 || response.error.localeCompare('User does not own quiz') === 0) {
      return res.status(403).json(response);
    }
    return res.status(400).json(response);
  }
  res.json(response);
});

app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const token = req.headers.token as string;
  const { questionBody } = req.body;
  const response = adminQuizQuestionUpdate(token, questionBody, quizId, questionId);
  res.json(response);
});

app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const token = req.query.token as string;
  const response = adminQuizQuestionDelete(token, quizId, questionId);
  if ('error' in response) {
    if (response.error.localeCompare('Token is empty or invalid') === 0) {
      return res.status(401).json(response);
    } else if (response.error.localeCompare('Invalid quizId') === 0 || response.error.localeCompare('User does not own quiz') === 0) {
      return res.status(403).json(response);
    }
    return res.status(400).json(response);
  }
  res.json(response);
});

app.delete('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const token = req.headers.token as string;
  const response = adminQuizQuestionDelete(token, quizId, questionId);
  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.body.token as string;
  const quizId = parseInt(req.params.quizid as string);
  const result = adminQuizRestore(token, quizId);
  if ('error' in result) {
    if (result.error.localeCompare('Token is empty or invalid') === 0) {
      return res.status(401).json(result);
    }
    if (result.error.localeCompare('Invalid quizId') === 0) {
      return res.status(403).json(result);
    }
    if (result.error.localeCompare('User does not own this quiz') === 0) {
      return res.status(403).json(result);
    }
    return res.status(400).json(result);
  }
  res.json(result);
});

app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid as string);
  const result = adminQuizRestore(token, quizId);
  res.json(result);
});

app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizId = parseInt(req.params.quizid as string);
  const result = adminQuizInfo(token, quizId);
  if ('error' in result) {
    if (result.error.localeCompare('Token is empty or invalid') === 0) {
      return res.status(401).json(result);
    }
    return res.status(403).json(result);
  }
  res.json(result);
});

app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid as string);
  const result = adminQuizInfo(token, quizId);
  res.json(result);
});

app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const token = req.body.token as string;
  const { name } = req.body;
  const result = adminQuizNameUpdate(token, quizId, name);
  if ('error' in result) {
    if (result.error.localeCompare('Token is empty or invalid') === 0) {
      return res.status(401).json(result);
    } else if (result.error.localeCompare('Invalid quizId') === 0 || result.error.localeCompare('User does not own quiz') === 0) {
      return res.status(403).json(result);
    }
    return res.status(400).json(result);
  }
  res.json(result);
});

app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const token = req.headers.token as string;
  const { name } = req.body;
  const result = adminQuizNameUpdate(token, quizId, name);
  res.json(result);
});

app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizIds = JSON.parse(req.query.quizIds as string);
  const result = adminQuizTrashEmpty(token, quizIds);
  res.json(result);
});

app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizIds = JSON.parse(req.query.quizIds as string);
  const result = adminQuizTrashEmpty(token, quizIds);
  res.json(result);
});

app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.body.token as string;
  const { questionBody } = req.body;
  const response = quizQuestionCreate1(token, questionBody, quizId);
  if ('error' in response) {
    if (response.error === 'Token is empty or invalid') {
      return res.status(401).json(response);
    } else if (response.error === 'Invalid quizId' || response.error === 'user does not own the quiz') {
      return res.status(403).json(response);
    }
    return res.status(400).json(response);
  }
  res.json(response);
});

app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const { questionBody } = req.body;
  const response = quizQuestionCreate2(token, questionBody, quizId);
  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.body.token as string;
  const { userEmail } = req.body;
  const response = quizTransfer1(token, userEmail, quizId);
  if ('error' in response) {
    if (response.error.localeCompare('Token is empty or invalid') === 0) {
      return res.status(401).json(response);
    } else if (response.error.localeCompare('Invalid quizId') === 0 || response.error.localeCompare('user does not own the quiz') === 0) {
      return res.status(403).json(response);
    }
    return res.status(400).json(response);
  }
  res.json(response);
});

app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const { userEmail } = req.body;
  const response = quizTransfer2(token, userEmail, quizId);
  res.json(response);
});

app.delete('/v1/clear', (req: Request, res: Response) => {
  const response = clear();
  res.json(response);
});

app.post('/v1/admin/quiz/:quizId/question/:questionId/duplicate', (req: Request, res: Response) => {
  const token = req.body.token as string;
  const quizId = parseInt(req.params.quizId as string);
  const questionId = parseInt(req.params.questionId as string);
  const result = adminQuizQuestionDuplicate(token, quizId, questionId);
  if ('error' in result) {
    if (result.error.localeCompare('Token is empty or invalid') === 0) {
      return res.status(401).json(result);
    } else if (result.error.localeCompare('Invalid questionId') === 0) {
      return res.status(400).json(result);
    }
    return res.status(403).json(result);
  }
  res.json(result);
});

app.post('/v2/admin/quiz/:quizId/question/:questionId/duplicate', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizId as string);
  const questionId = parseInt(req.params.questionId as string);
  const result = adminQuizQuestionDuplicate(token, quizId, questionId);
  res.json(result);
});

app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid as string);
  const imgUrl = req.body.imgUrl as string;
  const result = adminQuizThumbnailUpdate(token, quizId, imgUrl);
  res.json(result);
});
app.get('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const result = sessionMessagesList(playerId);
  res.json(result);
});

app.post('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const { message } = req.body;
  const result = sessionSendMessage(playerId, message);  
  res.json(result);
});

app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid as string);
  const result = viewSessions(token, quizId);
  res.json(result);
});

app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const { autoStartNum } = req.body;
  const response = sessionStart(token, quizId, autoStartNum);
  res.json(response);
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.json({ error });
});

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
  loadData();
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
  saveData();
});
