import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  emailOtpCookieName,
  verifyEmailOtpCookie,
} from "@/lib/email-otp.server";
import { getEmailValidationError } from "@/lib/auth-validation";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; otp?: string };
    const email = (body.email ?? "").trim().toLowerCase();
    const otp = (body.otp ?? "").trim();

    const formatError = getEmailValidationError(email, { required: true });
    if (formatError) {
      return NextResponse.json({ ok: false, message: formatError }, { status: 400 });
    }
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { ok: false, message: "Enter the 6-digit code from your email." },
        { status: 400 },
      );
    }

    const jar = await cookies();
    const result = verifyEmailOtpCookie(
      jar.get(emailOtpCookieName())?.value,
      email,
      otp,
    );
    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true, email });
    response.cookies.set({
      name: emailOtpCookieName(),
      value: "",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Unable to verify that code. Try again." },
      { status: 500 },
    );
  }
}
