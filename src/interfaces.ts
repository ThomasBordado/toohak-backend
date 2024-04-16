export interface messageInput {
  messageBody: string;
}

export interface Message {
  messageBody: string;
  playerId: number;
  playerName: string;
  timeSent: number;
}

export interface MessageListReturn {
  messages: Message[];
}

export interface playerWithSore {
  name: string;
  score: number;
}

export interface questionResult {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}

export interface getPlayerResultReturn {
  usersRankedByScore: playerWithSore[];
  questionResults: questionResult[];
}

export interface answer {
  answerId: number;
  answer: string;
  colour: string;
  correct: boolean;
}

export interface answerInput {
  answer: string;
  correct: boolean;
}

export interface quizQuestion {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  answers: answer[];
}

export interface quiz {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: quizQuestion[];
  duration: number;
  thumbnailUrl?: string;
}

export interface quizUser {
  quizId: number;
  name: string;
}

export interface user {
  userId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  prevpassword: string[];
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  quizzes: quizUser[];
  sessions: string[];
  trash: quizUser[];
}
export type EmptyObject = Record<string, never>;

export interface UserDetails {
  userId: number;
  name: string;
  email: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

export interface ErrorReturn {
  error: string;
}

export interface UserId {
  authUserId: number;
}

export interface SessionId {
  token: string;
}

export interface UserDetailsReturn {
  user: UserDetails;
}

export interface quizId {
  quizId: number;
}

export interface questionId {
  questionId: number;
}

export interface QuizListReturn {
  quizzes: quizUser[];
}

export interface quizQuestionCreateInput {
  question: string;
  duration: number;
  points: number;
  answers: answerInput[];
  thumbnailUrl: string;
}

export interface quizQuestionCreateInputV1 {
  question: string;
  duration: number;
  points: number;
  answers: answerInput[];
}

export interface quizQuestionCreateReturn {
  questionId: number;
}

export interface quizQuestionDuplicateReturn {
  newQuestionId: number;
}

export interface DataStore {
  users: user[];
  quizzes: quiz[];
  userIdStore: number;
  quizIdStore: number;
  sessionIdStore: number;
  questionIdStore: number;
  answerIdStore: number;
  trash: quiz[];
  quizSessionIdStore: number,
  quizSessions: QuizSession[],
}

export enum State {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END',
}

export enum Action {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END',
}

export interface QuizStatus {
  state: State;
  atQuestion: number;
  players: string[];
  metadata: quiz;
}

export interface UserRank {
  name: string;
  score: number;
}

export interface QuestionResults {
  questionId: number;
  playerCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}

export interface QuizResults {
  usersRankedByScore: UserRank[];
  questionResults: QuestionResults[];
}

export interface QuizSession {
  sessionId: number;
  autoStartNum: number;
  quizStatus: QuizStatus;
  quizResults: QuizResults;
  messages: Message[];
}