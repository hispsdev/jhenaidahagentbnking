import type { Request, Response } from "express";
import { timingSafeEqual } from "node:crypto";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../drizzle/schema";
import { ENV } from "./_core/env";

export const LOCAL_ADMIN_COOKIE = "agent_local_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function secretKey() {
  if (!ENV.cookieSecret) throw new Error("MANUS_JWT_SECRET is unavailable");
  return new TextEncoder().encode(ENV.cookieSecret);
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function localAdminCredentialsConfigured() {
  return Boolean(process.env.AGENT_ADMIN_USERNAME && process.env.AGENT_ADMIN_PASSWORD);
}

export function verifyLocalAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.AGENT_ADMIN_USERNAME ?? "";
  const expectedPassword = process.env.AGENT_ADMIN_PASSWORD ?? "";
  return Boolean(expectedUsername && expectedPassword) && safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword);
}

export async function createLocalAdminSession(username: string) {
  return new SignJWT({ localAdmin: true, username })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function authenticateLocalAdmin(req: Request): Promise<User | null> {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  const token = cookies[LOCAL_ADMIN_COOKIE];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (payload.localAdmin !== true || typeof payload.username !== "string") return null;
    const now = new Date();
    return {
      id: -2,
      openId: `local-admin:${payload.username}`,
      name: payload.username,
      email: null,
      loginMethod: "local",
      role: "admin",
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    };
  } catch {
    return null;
  }
}

function cookieSecurity(req: Request) {
  return req.get("x-forwarded-proto") === "https" || req.protocol === "https";
}

export function setLocalAdminCookie(req: Request, res: Response, token: string) {
  const secure = cookieSecurity(req);
  res.cookie(LOCAL_ADMIN_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS * 1000,
  });
}

export function clearLocalAdminCookie(req: Request, res: Response) {
  const secure = cookieSecurity(req);
  res.clearCookie(LOCAL_ADMIN_COOKIE, { httpOnly: true, secure, sameSite: secure ? "none" : "lax", path: "/" });
}
