import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionValue,
  getAdminTokenFromRequest,
  validateAdminToken,
} from "../../../../lib/admin";

export async function POST(request: Request) {
  try {
    const token = getAdminTokenFromRequest(request);
    const validation = validateAdminToken(token);

    if (!validation.ok) {
      return NextResponse.json({ message: validation.message }, { status: validation.status });
    }

    const response = NextResponse.json({ message: "Studio session created." });
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionValue(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create session." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ message: "Studio session cleared." });
    response.cookies.delete(ADMIN_SESSION_COOKIE);

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to clear session." },
      { status: 500 },
    );
  }
}
