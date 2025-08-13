// lib/session.ts
import { getIronSession, IronSession, IronSessionData } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionUser } from './types';

export const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'oorja-admin-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export async function getSession(): Promise<IronSession<SessionUser>> {
    const session = await getIronSession<SessionUser>(cookies(), sessionOptions);
    return session;
}
