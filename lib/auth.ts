import jwt from "jsonwebtoken";

const COOKIE_NAME = "wr-session";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export interface SessionUser {
  userId: number;
  email: string;
  name: string;
}

/**
 * Returns the JWT secret at call-time (not build-time) so the build succeeds
 * even when JWT_SECRET is not set.  In production, throws on first use if
 * the variable is absent — failing the request, not the build.
 */
function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[wedding-rate] JWT_SECRET environment variable is required in production. " +
          "Set it in your Railway service variables."
      );
    }
    // Dev/test only — NOT safe for production
    return "wedding-rate-dev-DO-NOT-USE-IN-PRODUCTION";
  }
  return s;
}

export function createToken(user: SessionUser): string {
  return jwt.sign(user, getSecret(), { expiresIn: "30d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, getSecret()) as SessionUser;
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
