export interface messageInput {
  messageBody: string;
}

export interface message {
  messageBody: string;
  playerId: number;
  playerName: string;
  timeSent: number;
}

export interface messages {
  messages: message[];
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
  thumbnailUrl: string;
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

export interface QuizListReturn {
  quizzes: quizUser[];
}

export interface quizQuestionCreateInput {
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
}
