import { IronSession } from 'iron-session';

export interface SessionData {
  user?: {
    email?: string;
    isLoggedIn?: boolean;
  };
}

export type SessionUser = IronSession<SessionData>['user'] & {
  email?: string;
  isLoggedIn?: boolean;
};
