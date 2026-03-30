import { createHash } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "clover_admin_session";

export function getAdminTokenFromRequest(request: Request) {
  const bearer = request.headers.get("authorization");
  const headerToken = request.headers.get("x-admin-token");

  if (headerToken) {
    return headerToken;
  }

  if (bearer?.startsWith("Bearer ")) {
    return bearer.slice(7);
  }

  return "";
}

function getSessionSignature(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return "";
  }

  const pairs = cookieHeader.split(";").map((item) => item.trim());
  const hit = pairs.find((pair) => pair.startsWith(`${name}=`));

  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : "";
}

export function createAdminSessionValue() {
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return "";
  }

  return getSessionSignature(adminToken);
}

export function validateAdminToken(token: string) {
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return {
      ok: false,
      status: 500,
      message: "ADMIN_TOKEN is not configured.",
    };
  }

  if (token !== adminToken) {
    return {
      ok: false,
      status: 401,
      message: "Unauthorized.",
    };
  }

  return {
    ok: true,
    status: 200,
    message: "Authorized.",
  } as const;
}

export function validateAdminRequest(request: Request) {
  const token = getAdminTokenFromRequest(request);

  if (token) {
    return validateAdminToken(token);
  }

  const session = getCookieValue(request.headers.get("cookie"), ADMIN_SESSION_COOKIE);
  const expected = createAdminSessionValue();

  if (!expected) {
    return {
      ok: false,
      status: 500,
      message: "ADMIN_TOKEN is not configured.",
    };
  }

  if (session === expected) {
    return {
      ok: true,
      status: 200,
      message: "Authorized.",
    } as const;
  }

  return {
    ok: false,
    status: 401,
    message: "Unauthorized.",
  };
}

export function isAdminSessionActive() {
  const cookieStore = cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  const expected = createAdminSessionValue();

  return Boolean(expected && session === expected);
}
