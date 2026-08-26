import { authFetch } from "@/lib/api";
import { getWalletSummary } from "@/lib/wallet-api";

export type ReferEarnDashboard = {
  enabled: boolean;
  inviteCode: string;
  shareMessage: string;
  hasAppliedCode?: boolean;
  program: {
    title: string;
    description: string;
    terms: string;
    requiredFriends: number;
    rewardAmount: number;
    freeRideKm: number;
    expiryDays: number;
    isEnabled: boolean;
  };
  stats: {
    referrals: number;
    firstRides: number;
    freeRides: number;
    pendingReferrals: number;
    totalEarned: number;
  };
  referrals: Array<{
    id: string;
    status: string;
    requiredRides: number;
    ridesCompleted: number;
    rewardAmount: number;
  }>;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function unwrap(value: unknown): unknown {
  const record = asRecord(value);
  if (!record) return value;
  if (record.data != null) return unwrap(record.data);
  if (record.result != null && typeof record.result === "object") {
    return unwrap(record.result);
  }
  return value;
}

function records(value: unknown, depth = 0): Record<string, unknown>[] {
  const row = asRecord(value);
  if (!row || depth > 5) return row ? [row] : [];
  const out = [row];
  for (const nested of Object.values(row)) {
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      out.push(...records(nested, depth + 1));
    }
  }
  return out;
}

function pickStr(source: unknown, keys: string[]): string {
  for (const row of records(unwrap(source))) {
    for (const key of keys) {
      const value = row[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  return "";
}

function pickNum(source: unknown, keys: string[]): number | null {
  for (const row of records(unwrap(source))) {
    for (const key of keys) {
      const value = row[key];
      if (value == null || value === "" || Array.isArray(value) || typeof value === "object") {
        continue;
      }
      const n = typeof value === "number" ? value : Number(value);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

function pickBool(source: unknown, keys: string[]): boolean | null {
  for (const row of records(unwrap(source))) {
    for (const key of keys) {
      if (typeof row[key] === "boolean") return row[key];
    }
  }
  return null;
}

function num(value: number | null, fallback: number) {
  return value == null ? fallback : value;
}

const PLAY_STORE =
  "https://play.google.com/store/apps/details?id=com.bullwave.rides.user";

function defaultShareMessage(code: string) {
  if (!code) return "Join Bull Wave Rides.";
  return `Join Bull Wave Rides with my code ${code}. Download the app: ${PLAY_STORE}&ref=${code}`;
}

function friendsPhrase(count: number) {
  return count === 1 ? "1 friend" : `${count} friends`;
}

function defaultDescription(friends: number, days: number) {
  return `Share your code. When ${friendsPhrase(friends)} complete their first ride, you get 1 free ride (valid ${days} days).`;
}

function defaultRewardLine(friends: number, km: number, days: number) {
  return `Reward: 1 free ride (up to ${km} km) after ${friendsPhrase(friends)} complete their first ride (expires in ${days} days)`;
}

function defaultTerms(days: number) {
  return `Each referred user counts once after their first completed ride. Free ride expires in ${days} days and cannot be transferred.`;
}

export function parseReferEarn(raw: unknown): ReferEarnDashboard {
  const body = asRecord(unwrap(raw)) ?? {};
  const programRow = asRecord(body.program) ?? asRecord(body.referral_program) ?? body;
  const statsRow = asRecord(body.stats) ?? body;
  const referralsRaw =
    body.referrals ??
    body.referral_list ??
    body.items ??
    asRecord(body.stats)?.referrals;
  const referrals = Array.isArray(referralsRaw)
    ? referralsRaw.map((item, index) => {
        const row = asRecord(item) ?? {};
        return {
          id: String(row.id ?? row.user_id ?? index),
          status: String(row.status ?? "pending"),
          requiredRides: num(pickNum(row, ["requiredRides", "required_rides"]), 1),
          ridesCompleted: num(pickNum(row, ["ridesCompleted", "rides_completed", "first_rides"]), 0),
          rewardAmount: num(pickNum(row, ["rewardAmount", "reward_amount"]), 0),
        };
      })
    : [];

  const inviteCode = pickStr(raw, [
    "inviteCode",
    "invite_code",
    "referral_code",
    "referralCode",
  ]);

  const requiredFriends = Math.max(
    1,
    num(
      pickNum(programRow, [
        "requiredFriends",
        "required_friends",
        "requiredRides",
        "required_rides",
        "target_count",
      ]) ?? pickNum(body, ["required_friends", "required_rides"]),
      3,
    ),
  );
  const expiryDays = Math.max(
    1,
    num(pickNum(programRow, ["expiryDays", "expiry_days", "valid_days", "reward_valid_days"]), 5),
  );
  const freeRideKm = Math.max(
    1,
    num(pickNum(programRow, ["freeRideKm", "free_ride_km", "max_km", "reward_km"]), 10),
  );

  const firstFromList = referrals.filter((row) => row.ridesCompleted >= 1).length;
  const firstRides = num(
    pickNum(statsRow, ["firstRides", "first_rides", "completed_first_rides", "successful_referrals"]),
    firstFromList,
  );
  const referralsCount = num(
    pickNum(statsRow, ["totalReferrals", "total_referrals", "referrals_count", "referrals"]),
    referrals.length,
  );
  const freeRides = num(
    pickNum(statsRow, ["freeRides", "free_rides", "rewards_unlocked", "rewards_count"]),
    Math.floor(firstRides / requiredFriends),
  );

  const enabledFlag = pickBool(raw, ["enabled", "isEnabled", "is_enabled"]);
  const enabled = enabledFlag !== false;

  const backendDescription = pickStr(programRow, ["description", "subtitle"]);
  const backendTerms = pickStr(programRow, ["terms", "fine_print", "notes"]);

  return {
    enabled,
    inviteCode,
    shareMessage: pickStr(raw, ["shareMessage", "share_message", "invite_message"]) ||
      defaultShareMessage(inviteCode),
    hasAppliedCode: Boolean(
      pickBool(raw, ["hasAppliedCode", "has_applied_code"]) ??
        pickStr(raw, ["applied_code", "appliedCode"]),
    ),
    program: {
      title: pickStr(programRow, ["title", "name"]) || "Refer & Earn",
      description: backendDescription || defaultDescription(requiredFriends, expiryDays),
      terms: backendTerms || defaultTerms(expiryDays),
      requiredFriends,
      rewardAmount: num(pickNum(programRow, ["rewardAmount", "reward_amount", "reward_inr"]), 0),
      freeRideKm,
      expiryDays,
      isEnabled: enabled,
    },
    stats: {
      referrals: referralsCount,
      firstRides,
      freeRides,
      pendingReferrals: num(
        pickNum(statsRow, ["pendingReferrals", "pending_referrals", "pending"]),
        0,
      ),
      totalEarned: num(
        pickNum(statsRow, ["totalEarned", "total_earned", "earned", "referral_earned"]),
        0,
      ),
    },
    referrals,
  };
}

export function mergeReferEarn(
  primary: ReferEarnDashboard,
  extras: { inviteCode?: string | null; totalEarned?: number | null },
): ReferEarnDashboard {
  const inviteCode = primary.inviteCode || extras.inviteCode?.trim() || "";
  return {
    ...primary,
    inviteCode,
    shareMessage: primary.inviteCode ? primary.shareMessage : defaultShareMessage(inviteCode),
    stats: {
      ...primary.stats,
      totalEarned:
        primary.stats.totalEarned ||
        (typeof extras.totalEarned === "number" ? extras.totalEarned : 0),
    },
  };
}

export function referEarnProgress(dashboard: ReferEarnDashboard) {
  const need = Math.max(1, dashboard.program.requiredFriends);
  const first = dashboard.stats.firstRides;
  const free = dashboard.stats.freeRides;
  const current = need === 1 ? Number(first > free) : first % need;
  return { current, need, percent: Math.round((current / need) * 100) };
}

export function referEarnRewardLine(dashboard: ReferEarnDashboard) {
  const { requiredFriends, freeRideKm, expiryDays, rewardAmount } = dashboard.program;
  if (rewardAmount > 0) {
    return `Reward: ₹${rewardAmount} after ${friendsPhrase(requiredFriends)} complete their first ride (expires in ${expiryDays} days)`;
  }
  return defaultRewardLine(requiredFriends, freeRideKm, expiryDays);
}

export async function getReferEarn(): Promise<ReferEarnDashboard> {
  const [referResult, profileResult, walletResult] = await Promise.allSettled([
    authFetch<unknown>("/refer-earn", undefined, "Unable to load Refer & Earn"),
    authFetch<unknown>("/profile", undefined, "Unable to load profile"),
    getWalletSummary(),
  ]);

  if (referResult.status === "rejected") {
    const message = referResult.reason instanceof Error ? referResult.reason.message : "";
    if (!/not found|404/i.test(message)) throw referResult.reason;
  }

  const parsed =
    referResult.status === "fulfilled"
      ? parseReferEarn(referResult.value)
      : parseReferEarn({});

  const profileCode =
    profileResult.status === "fulfilled"
      ? pickStr(profileResult.value, ["referral_code", "referralCode", "invite_code", "inviteCode"])
      : "";

  const wallet =
    walletResult.status === "fulfilled" ? walletResult.value : null;

  return mergeReferEarn(parsed, {
    inviteCode: profileCode,
    totalEarned: wallet?.referral_earned ?? wallet?.referral_balance ?? null,
  });
}

export async function applyReferEarnCode(code: string): Promise<ReferEarnDashboard> {
  const trimmed = code.trim().toUpperCase();
  const bodies = [{ code: trimmed }, { referral_code: trimmed }, { invite_code: trimmed }];
  let lastError: Error | null = null;

  for (const body of bodies) {
    try {
      await authFetch<unknown>(
        "/refer-earn/apply",
        { method: "POST", body: JSON.stringify(body) },
        "Could not apply code",
      );
      return getReferEarn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Could not apply code");
      const message = lastError.message;
      if (!/422|validation|required|field required/i.test(message)) {
        throw lastError;
      }
    }
  }

  throw lastError ?? new Error("Could not apply code");
}
