import { IronSessionData } from 'iron-session';

export type SessionUser = IronSessionData & {
  email?: string;
  isLoggedIn?: boolean;
};
