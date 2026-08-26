/**
 * Client-side auth field validation — blocks dummy / disposable values
 * before they are sent to the backend.
 */

const BLOCKED_EMAIL_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "test.org",
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "trashmail.com",
  "yopmail.com",
  "fakeinbox.com",
  "sharklasers.com",
  "mailnesia.com",
  "discard.email",
  "emailondeck.com",
  "getnada.com",
  "moakt.com",
  "throwaway.email",
  "mailnull.com",
  "maildrop.cc",
  "tempail.com",
]);

const BLOCKED_LOCAL_PARTS = new Set([
  "test",
  "testing",
  "tester",
  "dummy",
  "fake",
  "asdf",
  "asdfgh",
  "qwerty",
  "qwertyuiop",
  "abc",
  "abcd",
  "abcde",
  "abcdef",
  "admin",
  "user",
  "username",
  "null",
  "undefined",
  "noreply",
  "no-reply",
  "email",
  "myemail",
  "sample",
  "demo",
  "demo1",
  "guest",
  "temp",
  "temporary",
  "xxx",
  "xyz",
  "aaa",
  "bbb",
  "ccc",
  "hello",
  "hi",
  "name",
  "fullname",
  "yourname",
]);

const BLOCKED_NAME_TOKENS = new Set([
  "test",
  "testing",
  "tester",
  "dummy",
  "fake",
  "asdf",
  "qwerty",
  "abc",
  "abcd",
  "admin",
  "user",
  "guest",
  "null",
  "undefined",
  "demo",
  "sample",
  "xxx",
  "xyz",
  "name",
  "fullname",
  "yourname",
  "firstname",
  "lastname",
]);

const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password12",
  "password123",
  "passw0rd",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty123",
  "qwertyui",
  "abcdefgh",
  "abcdefg1",
  "11111111",
  "00000000",
  "iloveyou",
  "welcome1",
  "admin123",
  "letmein1",
  "monkey12",
  "dragon12",
  "bullwave",
  "bullwave1",
  "waveride",
  "waverides",
]);

function normalizeLocal(local: string) {
  return local.replace(/[._+-]/g, "").toLowerCase();
}

function isSequentialAlpha(value: string) {
  if (value.length < 3) return false;
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  return alphabet.includes(value) || alphabet.split("").reverse().join("").includes(value);
}

function isKeyboardWalk(value: string) {
  const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890"];
  return rows.some((row) => row.includes(value) || [...row].reverse().join("").includes(value));
}

/** Returns an error message, or null when the email is acceptable. Empty string → null (optional fields). */
export function getEmailValidationError(
  value: string,
  options?: { required?: boolean },
): string | null {
  const email = value.trim().toLowerCase();

  if (!email) {
    return options?.required ? "Please enter an email address" : null;
  }

  if (email.length > 254) {
    return "Email address is too long";
  }

  const shape =
    /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
  if (!shape.test(email) || email.includes("..")) {
    return "Enter a valid email like name@domain.com";
  }

  const [local, domain] = email.split("@");
  if (!local || !domain) {
    return "Enter a valid email like name@domain.com";
  }

  if (local.length > 64) {
    return "Email address is too long";
  }

  const labels = domain.split(".");
  const tld = labels[labels.length - 1] ?? "";
  if (tld.length < 2 || !/^[a-z]+$/i.test(tld)) {
    return "Enter a valid email like name@domain.com";
  }

  if (BLOCKED_EMAIL_DOMAINS.has(domain)) {
    return "Please use a real email address (not a temporary or test domain)";
  }

  const localKey = normalizeLocal(local);

  if (BLOCKED_LOCAL_PARTS.has(localKey)) {
    return "Please use your real email — dummy addresses like abc@… are not allowed";
  }

  if (/^(test|dummy|fake|demo|sample|asdf|qwerty|abc|user|admin|temp)/i.test(localKey)) {
    return "Please use your real email — test or dummy addresses are not allowed";
  }

  if (/^(.)\1{3,}$/.test(localKey)) {
    return "Please use your real email address";
  }

  if (/^\d+$/.test(localKey) && localKey.length <= 6) {
    return "Please use your real email address";
  }

  if (isSequentialAlpha(localKey) || isKeyboardWalk(localKey)) {
    return "Please use your real email — dummy addresses are not allowed";
  }

  return null;
}

export function getFullNameValidationError(value: string): string | null {
  const name = value.trim().replace(/\s+/g, " ");

  if (!name) {
    return "Please enter your full name";
  }

  if (name.length < 2) {
    return "Name must be at least 2 characters";
  }

  if (name.length > 80) {
    return "Name is too long";
  }

  if (!/^[a-zA-Z][a-zA-Z\s'.-]*$/.test(name)) {
    return "Name can only contain letters and spaces";
  }

  const tokens = name
    .toLowerCase()
    .split(/[\s'.-]+/)
    .filter(Boolean);

  if (tokens.some((token) => BLOCKED_NAME_TOKENS.has(token))) {
    return "Please enter your real name — dummy names are not allowed";
  }

  if (tokens.every((token) => token.length === 1)) {
    return "Please enter your real full name";
  }

  if (tokens.some((token) => /^(.)\1{2,}$/.test(token))) {
    return "Please enter your real name";
  }

  return null;
}

export function getPasswordValidationError(password: string): string | null {
  if (!password) {
    return "Password is required";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  if (password.length > 128) {
    return "Password is too long";
  }

  if (/\s/.test(password)) {
    return "Password cannot contain spaces";
  }

  if (!/[a-z]/.test(password)) {
    return "Include at least one lowercase letter";
  }

  if (!/[A-Z]/.test(password)) {
    return "Include at least one uppercase letter";
  }

  if (!/[0-9]/.test(password)) {
    return "Include at least one number";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Include at least one special character (!@#$%…)";
  }

  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) {
    return "This password is too common — choose a stronger one";
  }

  if (/^(.)\1+$/.test(password) || /^(0123456789|9876543210|abcdefgh|qwertyui)/i.test(password)) {
    return "This password is too predictable — choose a stronger one";
  }

  return null;
}

/** 0–4 strength score for UI meters. */
export function passwordStrengthScore(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) && password.length >= 10) score += 1;
  else if (/[^A-Za-z0-9]/.test(password) && score >= 2) score += 1;
  return Math.min(score, 4);
}

export function isSecurePassword(password: string): boolean {
  return getPasswordValidationError(password) === null;
}
