import { authFetch } from "@/lib/api";

export interface WalletBalance {
  balance: number;
  bonus_balance: number;
  referral_balance: number;
  total: number;
  has_bank_account?: boolean;
  bank?: {
    account_holder: string;
    account_number: string;
    ifsc: string;
    bank_name: string;
    upi_id?: string | null;
  } | null;
}

export interface WalletSummary extends WalletBalance {
  cashback_total?: number;
  referral_earned?: number;
}

export interface WalletTransaction {
  amount: number;
  type: "credit" | "debit";
  description: string;
  at: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  label: string;
  last_four: string | null;
}

interface BackendTransaction {
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

export function getWalletBalance(): Promise<WalletBalance> {
  return authFetch<WalletBalance>("/wallet", undefined, "Unable to load wallet");
}

export function getWalletSummary(): Promise<WalletSummary> {
  return authFetch<WalletSummary>("/wallet", undefined, "Unable to load wallet summary");
}

export function getWalletTransactions(page = 1, pageSize = 20): Promise<WalletTransaction[]> {
  return authFetch<BackendTransaction[]>(
    `/transactions?page=${page}&page_size=${pageSize}`,
    undefined,
    "Unable to load transactions"
  ).then((items) =>
    items.map((t) => ({
      amount: t.amount,
      type: t.transaction_type.toLowerCase() === "credit" ? "credit" : "debit",
      description: t.description,
      at: t.created_at,
    }))
  );
}

export function saveWalletBank(payload: {
  payment_type: "bank" | "upi";
  account_holder_name: string;
  account_number?: string;
  ifsc_code?: string;
  bank_name?: string;
  upi_id?: string;
}) {
  return authFetch(
    "/wallet/bank",
    { method: "POST", body: JSON.stringify(payload) },
    "Unable to save bank account"
  );
}

export function requestWalletWithdraw(amount: number) {
  return authFetch<{ id: string; status: string; message: string }>(
    "/wallet/withdraw",
    { method: "POST", body: JSON.stringify({ amount }) },
    "Unable to request withdrawal"
  );
}

export interface WalletCheckout {
  key_id: string;
  order_id: string;
  amount?: number;
  currency?: string;
  name?: string;
  description?: string;
  environment?: string;
  prefill?: { name?: string; email?: string; contact?: string };
}

export function createWalletCheckout(amount: number): Promise<{ checkout: WalletCheckout } | WalletCheckout> {
  return authFetch<{ checkout: WalletCheckout } | WalletCheckout>(
    "/wallet/checkout",
    { method: "POST", body: JSON.stringify({ amount }) },
    "Unable to start wallet top-up"
  );
}

export function verifyWalletPayment(payload: {
  order_id: string;
  payment_id?: string;
  signature?: string;
}): Promise<{ balance?: number; message?: string }> {
  return authFetch(
    "/wallet/verify-payment",
    { method: "POST", body: JSON.stringify(payload) },
    "Unable to verify wallet payment"
  );
}

/** @deprecated Direct credit disabled — use createWalletCheckout + Razorpay. */
export function addWalletMoney(amount: number): Promise<WalletBalance> {
  return createWalletCheckout(amount).then(() => {
    throw new Error("Complete payment in Razorpay checkout to add money");
  });
}

/** Product payment options for wallet top-up UI (Cash / Wallet). Not fabricated balances. */
export function getPaymentMethods(): Promise<PaymentMethod[]> {
  return Promise.resolve([
    { id: "cash", type: "cash", label: "Cash", last_four: null },
    { id: "wallet", type: "wallet", label: "Wallet", last_four: null },
  ]);
}
