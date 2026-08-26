import {
  GoogleAuthProvider,
  signInWithPhoneNumber,
  signInWithPopup,
  type ConfirmationResult,
  type RecaptchaVerifier,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/firebase/firebase";
import { apiFetch } from "@/lib/api";

export interface AuthUserLike {
  id?: string;
  phone: string;
  name?: string | null;
  email?: string | null;
}

export interface FirebaseAuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user: AuthUserLike;
}

export interface GoogleSignInProfile {
  idToken: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  photoUrl: string | null;
  uid: string;
}

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-phone-number": "Invalid phone number. Check the number and country code.",
  "auth/missing-phone-number": "Please enter your mobile number.",
  "auth/too-many-requests": "Too many attempts. Please wait and try again later.",
  "auth/quota-exceeded": "SMS quota exceeded. Try again later.",
  "auth/captcha-check-failed": "reCAPTCHA verification failed. Refresh and try again.",
  "auth/invalid-verification-code": "Invalid OTP. Please check and try again.",
  "auth/code-expired": "OTP expired. Request a new code.",
  "auth/session-expired": "Session expired. Request a new OTP.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/internal-error": "Authentication service error. Please try again.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/cancelled-popup-request": "Google sign-in was cancelled.",
  "auth/popup-blocked": "Pop-up blocked. Allow pop-ups for this site and try again.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method.",
  "auth/unauthorized-domain":
    "This domain is not authorized for Google sign-in. Add it in Firebase Authentication settings.",
  "auth/operation-not-allowed":
    "Google sign-in is not enabled. Enable the Google provider in Firebase Authentication.",
};

export function mapFirebaseError(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: string }).code);
    if (FIREBASE_ERROR_MESSAGES[code]) {
      return FIREBASE_ERROR_MESSAGES[code];
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

/** Send real SMS OTP via Firebase Phone Authentication. */
export async function sendPhoneOtp(
  e164Phone: string,
  recaptchaVerifier: RecaptchaVerifier,
): Promise<ConfirmationResult> {
  const auth = getFirebaseAuth();
  try {
    await recaptchaVerifier.render();
  } catch {
    // Already rendered — safe to continue
  }
  return signInWithPhoneNumber(auth, e164Phone, recaptchaVerifier);
}

/** Verify the 6-digit SMS code with Firebase. */
export async function verifyPhoneOtp(
  confirmation: ConfirmationResult,
  otp: string,
): Promise<string> {
  const credential = await confirmation.confirm(otp);
  const idToken = await credential.user.getIdToken(true);
  return idToken;
}

function profileFromFirebaseUser(user: User, idToken: string): GoogleSignInProfile {
  return {
    idToken,
    email: user.email,
    name: user.displayName,
    phone: user.phoneNumber,
    photoUrl: user.photoURL,
    uid: user.uid,
  };
}

/** Open Google account picker via Firebase Auth (real Google OAuth). */
export async function signInWithGooglePopup(): Promise<GoogleSignInProfile> {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Google sign-in is not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables.",
    );
  }

  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken(true);
  return profileFromFirebaseUser(result.user, idToken);
}

function parseTokenPayload(json: unknown): {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  user?: AuthUserLike;
} {
  if (!json || typeof json !== "object") {
    throw new Error("Invalid authentication response from server");
  }
  const record = json as Record<string, unknown>;
  if (record.data && typeof record.data === "object") {
    return parseTokenPayload(record.data);
  }
  if (typeof record.access_token !== "string") {
    throw new Error("Invalid authentication response from server");
  }
  const user =
    record.user && typeof record.user === "object"
      ? (record.user as AuthUserLike)
      : undefined;
  return {
    access_token: record.access_token,
    refresh_token:
      typeof record.refresh_token === "string" ? record.refresh_token : undefined,
    token_type: typeof record.token_type === "string" ? record.token_type : "bearer",
    user,
  };
}

async function fetchAuthUser(
  accessToken: string,
  fallback?: Partial<AuthUserLike>,
): Promise<AuthUserLike> {
  try {
    const me = await apiFetch<{
      id: string;
      email?: string;
      phone?: string;
      first_name?: string;
      last_name?: string;
      full_name?: string | null;
    }>(
      "/auth/me",
      { headers: { Authorization: `Bearer ${accessToken}` }, skipAuth: true },
      "Unable to load profile",
    );
    const name =
      me.full_name?.trim() ||
      [me.first_name, me.last_name].filter(Boolean).join(" ").trim() ||
      fallback?.name ||
      null;
    return {
      id: me.id,
      phone: me.phone || fallback?.phone || "",
      name,
      email: me.email || fallback?.email || null,
    };
  } catch {
    return {
      phone: fallback?.phone || "",
      name: fallback?.name ?? null,
      email: fallback?.email ?? null,
    };
  }
}

/**
 * Exchange a Firebase ID token (phone or Google) for Bull Wave JWT tokens.
 * Hits the real auth API — same contract the Flutter user app uses for Firebase login.
 */
export async function loginWithFirebaseToken(
  firebaseToken: string,
  profileHint?: Partial<AuthUserLike>,
): Promise<FirebaseAuthResponse> {
  const attempts: Array<{ path: string; body: Record<string, unknown> }> = [
    {
      path: "/auth/firebase-login",
      body: {
        firebase_token: firebaseToken,
        id_token: firebaseToken,
        provider: "google",
        role: "user",
      },
    },
    {
      path: "/auth/google-login",
      body: {
        id_token: firebaseToken,
        google_id_token: firebaseToken,
        provider: "google",
        role: "user",
      },
    },
  ];

  let lastError: Error | null = null;

  for (const attempt of attempts) {
    try {
      const raw = await apiFetch<unknown>(
        attempt.path,
        {
          method: "POST",
          body: JSON.stringify(attempt.body),
          skipAuth: true,
        },
        "Unable to sign in with Google. Please try again.",
      );
      const tokens = parseTokenPayload(raw);
      const user =
        tokens.user ??
        (await fetchAuthUser(tokens.access_token, {
          phone: profileHint?.phone || "",
          name: profileHint?.name,
          email: profileHint?.email,
        }));
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type ?? "bearer",
        user: {
          id: user.id,
          phone: user.phone || profileHint?.phone || "",
          name: user.name ?? profileHint?.name ?? null,
          email: user.email ?? profileHint?.email ?? null,
        },
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // Try next endpoint shape when this path is missing on the server.
      if (!/not found|404/i.test(lastError.message)) {
        throw lastError;
      }
    }
  }

  throw (
    lastError ??
    new Error(
      "Google sign-in is not available on the server yet. Ask the backend team to enable /auth/firebase-login.",
    )
  );
}

/** Full Google sign-in → backend JWT exchange. */
export async function loginWithGoogle(): Promise<FirebaseAuthResponse> {
  try {
    const google = await signInWithGooglePopup();
    return await loginWithFirebaseToken(google.idToken, {
      phone: google.phone || "",
      name: google.name,
      email: google.email,
    });
  } catch (error) {
    throw new Error(mapFirebaseError(error));
  }
}
