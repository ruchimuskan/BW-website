import { resolveMx } from "node:dns/promises";
import { getEmailValidationError } from "@/lib/auth-validation";

export type MailboxCheckResult =
  | { ok: true; email: string }
  | { ok: false; message: string };

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

async function hasMxRecords(domain: string): Promise<"yes" | "no" | "unknown"> {
  try {
    const records = await resolveMx(domain);
    return records.some((row) => Boolean(row.exchange)) ? "yes" : "no";
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOTFOUND" || code === "ENODATA" || code === "ENOTIMP") {
      return "no";
    }
    return "unknown";
  }
}

type DisifyResult = {
  disposable?: boolean;
  dns?: boolean;
};

async function lookupDisify(email: string): Promise<DisifyResult | null> {
  try {
    const response = await fetch(
      `https://disify.com/api/email/${encodeURIComponent(email)}`,
      { cache: "no-store", signal: AbortSignal.timeout(6000) },
    );
    if (!response.ok) return null;
    return (await response.json()) as DisifyResult;
  } catch {
    return null;
  }
}

/** Server-only: format + MX + disposable mailbox check. */
export async function checkWorkingMailbox(
  rawEmail: string,
  fullName?: string,
): Promise<MailboxCheckResult> {
  const email = normalizeEmail(rawEmail);
  const formatError = getEmailValidationError(email, {
    required: true,
    fullName,
  });
  if (formatError) {
    return { ok: false, message: formatError };
  }

  const domain = email.split("@")[1] ?? "";
  const mx = await hasMxRecords(domain);
  const disify = await lookupDisify(email);

  if (disify?.disposable === true) {
    return {
      ok: false,
      message: "Please use a real, lasting email — temporary inboxes are not allowed.",
    };
  }

  if (mx === "no" || disify?.dns === false) {
    return {
      ok: false,
      message: "This email domain cannot receive mail. Use a working inbox.",
    };
  }

  return { ok: true, email };
}
