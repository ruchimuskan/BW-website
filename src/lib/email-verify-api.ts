async function readJson(response: Response): Promise<Record<string, unknown>> {
  return (await response.json().catch(() => ({}))) as Record<string, unknown>;
}

function messageOf(json: Record<string, unknown>, fallback: string): string {
  return typeof json.message === "string" && json.message.trim()
    ? json.message
    : fallback;
}

export async function checkEmailMailbox(
  email: string,
  fullName?: string,
): Promise<string> {
  const response = await fetch("/api/auth/email/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, fullName }),
  });
  const json = await readJson(response);
  if (!response.ok || json.ok === false) {
    throw new Error(messageOf(json, "This email cannot receive mail."));
  }
  return typeof json.email === "string" ? json.email : email.trim().toLowerCase();
}

export async function sendEmailVerificationCode(
  email: string,
  fullName?: string,
): Promise<{ email: string; message: string }> {
  const response = await fetch("/api/auth/email/send-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, fullName }),
  });
  const json = await readJson(response);
  if (!response.ok || json.ok === false) {
    throw new Error(
      messageOf(json, "Unable to send a verification email to this address."),
    );
  }
  return {
    email: typeof json.email === "string" ? json.email : email.trim().toLowerCase(),
    message: messageOf(json, "Verification code sent. Check your inbox."),
  };
}

export async function verifyEmailVerificationCode(
  email: string,
  otp: string,
): Promise<string> {
  const response = await fetch("/api/auth/email/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const json = await readJson(response);
  if (!response.ok || json.ok === false) {
    throw new Error(messageOf(json, "Invalid email verification code."));
  }
  return typeof json.email === "string" ? json.email : email.trim().toLowerCase();
}
