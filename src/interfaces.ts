export interface quiz {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
}

export interface quizUser {
  quizId: number;
  name: string;
}

export type EmptyObject = Record<string, never>;

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
}

export interface ErrorReturn {
  error: string;
}

export interface UserId {
  authUserId: number;
}

export interface quizId {
  quizId: number;
}

export interface UserDetailsReturn {
  user: user;
}

export interface DataStore {
  users: user[];
  quizzes: quiz[];
  userIdStore: number;
  quizIdStore: number;
}
