export type SessionUser = {
  email?: string;
  isLoggedIn?: boolean;
  // Extra session fields, if any
  [key: string]: unknown;
};
