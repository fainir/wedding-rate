import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "wedding-rate-dev-secret-change-in-prod";
const COOKIE_NAME = "wr-session";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export interface SessionUser {
  userId: number;
  email: string;
  name: string;
}

export function createToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export { COOKIE_NAME, COOKIE_MAX_AGE };

export function getCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  };
}
