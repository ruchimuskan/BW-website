import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "bw-email-otp";
const TTL_MS = 10 * 60 * 1000;

type OtpPayload = {
  email: string;
  exp: number;
  hash: string;
};

function secret(): string {
  return (
    process.env.EMAIL_OTP_SECRET ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "bw-rides-email-otp"
  );
}

function hmac(email: string, otp: string, exp: number): string {
  return createHmac("sha256", secret())
    .update(`${email}:${otp}:${exp}`)
    .digest("hex");
}

export function generateEmailOtp(): string {
  return String(randomInt(100000, 1000000));
}

export function serializeEmailOtpCookie(email: string, otp: string): {
  name: string;
  value: string;
  maxAge: number;
} {
  const exp = Date.now() + TTL_MS;
  const payload: OtpPayload = {
    email,
    exp,
    hash: hmac(email, otp, exp),
  };
  return {
    name: COOKIE_NAME,
    value: Buffer.from(JSON.stringify(payload), "utf8").toString("base64url"),
    maxAge: Math.floor(TTL_MS / 1000),
  };
}

export function emailOtpCookieName(): string {
  return COOKIE_NAME;
}

export function verifyEmailOtpCookie(
  cookieValue: string | undefined,
  email: string,
  otp: string,
): { ok: true } | { ok: false; message: string } {
  if (!cookieValue) {
    return { ok: false, message: "No email code is pending. Request a new code." };
  }
  try {
    const parsed = JSON.parse(
      Buffer.from(cookieValue, "base64url").toString("utf8"),
    ) as OtpPayload;
    if (!parsed?.email || !parsed.hash || !parsed.exp) {
      return { ok: false, message: "Invalid verification session. Request a new code." };
    }
    if (parsed.email !== email.trim().toLowerCase()) {
      return { ok: false, message: "This code was issued for a different email." };
    }
    if (Date.now() > parsed.exp) {
      return { ok: false, message: "That code has expired. Request a new one." };
    }
    const expected = hmac(parsed.email, otp.trim(), parsed.exp);
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(parsed.hash, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, message: "Invalid code. Check the email and try again." };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: "Invalid verification session. Request a new code." };
  }
}

export async function deliverEmailOtp(email: string, otp: string): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "BW Rides <noreply@bullwaverides.com>",
        to: [email],
        subject: "Your BW Rides email verification code",
        text: `Your BW Rides verification code is ${otp}. It expires in 10 minutes.`,
      }),
    });
    if (!response.ok) {
      throw new Error("Unable to send a verification email to this address.");
    }
    return;
  }

  const response = await fetch(
    `https://formsubmit.co/ajax/${encodeURIComponent(email)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: "BW Rides email verification code",
        _template: "box",
        _captcha: "false",
        name: "BW Rides",
        message: `Your BW Rides verification code is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`,
      }),
      signal: AbortSignal.timeout(12_000),
    },
  );

  if (!response.ok) {
    throw new Error(
      "Unable to send a verification email to this address. Use an inbox you can open.",
    );
  }
}
