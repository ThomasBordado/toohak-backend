export interface quiz {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  quizQuestions: quizQuestion[];
}

export interface quizQuestion {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  answers: answer[];
}

export interface answer {
  answer: string;
  correct: boolean;
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
  sessions: number[];
  trash: quiz[];
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

export interface DataStore {
  users: user[];
  quizzes: quiz[];
  userIdStore: number;
  quizIdStore: number;
  sessionIdStore: number;
}
