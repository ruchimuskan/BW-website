import { NextResponse } from "next/server";
import { checkWorkingMailbox } from "@/lib/email-mailbox.server";
import {
  deliverEmailOtp,
  generateEmailOtp,
  serializeEmailOtpCookie,
} from "@/lib/email-otp.server";

const lastSent = new Map<string, number>();

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; fullName?: string };
    const mailbox = await checkWorkingMailbox(body.email ?? "", body.fullName);
    if (!mailbox.ok) {
      return NextResponse.json(
        { ok: false, message: mailbox.message },
        { status: 400 },
      );
    }

    const now = Date.now();
    const previous = lastSent.get(mailbox.email) ?? 0;
    if (now - previous < 45_000) {
      return NextResponse.json(
        { ok: false, message: "Please wait a moment before requesting another code." },
        { status: 429 },
      );
    }

    const otp = generateEmailOtp();
    await deliverEmailOtp(mailbox.email, otp);
    lastSent.set(mailbox.email, now);

    const cookie = serializeEmailOtpCookie(mailbox.email, otp);
    const response = NextResponse.json({
      ok: true,
      email: mailbox.email,
      message: "Verification code sent. Check your inbox (and spam folder).",
    });
    response.cookies.set({
      name: cookie.name,
      value: cookie.value,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: cookie.maxAge,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to send a verification email to this address.",
      },
      { status: 400 },
    );
  }
}
