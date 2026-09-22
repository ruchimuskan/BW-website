"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuthSession } from "@/lib/auth-session";
import { getEmailValidationError } from "@/lib/auth-validation";
import { getAuthSession, isPlaceholderDisplayName } from "@/lib/auth-session";
import { getProfile, type Profile } from "@/lib/profile-api";

export interface AuthUserDisplay {
  name: string;
  phone: string;
  email: string;
  initial: string;
  rating: number;
  profileImageUrl?: string | null;
  isLoading: boolean;
}

const DEFAULT_USER: AuthUserDisplay = {
  name: "",
  phone: "",
  email: "",
  initial: "?",
  rating: 0,
  isLoading: true,
};

export function getNameInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

export function getDisplayName(session: Pick<AuthSession, "name">): string {
  const name = session.name?.trim() || "";
  return isPlaceholderDisplayName(name) ? "" : name;
}

export function sessionToUserDisplay(
  session: AuthSession,
  profile?: Profile | null
): AuthUserDisplay {
  const rawName = profile?.full_name?.trim() || getDisplayName(session);
  const name = isPlaceholderDisplayName(rawName) ? "" : rawName;
  const rawEmail = profile?.email?.trim() || session.email?.trim() || "";
  const emailOk =
    rawEmail &&
    getEmailValidationError(rawEmail, {
      required: true,
      fullName: name,
    }) === null;

  return {
    name,
    phone: profile?.phone || session.phone,
    email: emailOk ? rawEmail : "",
    initial: getNameInitial(name),
    rating: typeof profile?.rating_avg === "number" ? profile.rating_avg : 0,
    profileImageUrl: profile?.profile_image_url,
    isLoading: false,
  };
}

export function useAuthUser(): AuthUserDisplay {
  const [user, setUser] = useState<AuthUserDisplay>(DEFAULT_USER);

  const sync = useCallback(async () => {
    const session = getAuthSession();
    if (!session?.accessToken) {
      setUser({ ...DEFAULT_USER, isLoading: false, name: "" });
      return;
    }

    try {
      const profile = await getProfile();
      setUser(sessionToUserDisplay(session, profile));
    } catch {
      setUser({ ...sessionToUserDisplay(session), isLoading: false });
    }
  }, []);

  useEffect(() => {
    void sync();
    window.addEventListener("storage", sync);
    window.addEventListener("wavego-auth-update", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("wavego-auth-update", sync);
    };
  }, [sync]);

  return user;
}
