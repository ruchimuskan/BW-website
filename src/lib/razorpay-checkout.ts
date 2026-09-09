/** Razorpay hosted checkout (popup) for subscription / wallet payments. */

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

const ALLOWED_PAYMENT_HOSTS = new Set([
  "checkout.razorpay.com",
  "api.razorpay.com",
  "rzp.io",
]);

let razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay is only available in the browser"));
  }
  if (window.Razorpay) return Promise.resolve();
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout"));
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

/** Only allow known Razorpay hosts before redirecting the browser. */
export function isAllowedPaymentRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    if (ALLOWED_PAYMENT_HOSTS.has(host)) return true;
    return [...ALLOWED_PAYMENT_HOSTS].some(
      (allowed) => host === allowed || host.endsWith(`.${allowed}`),
    );
  } catch {
    return false;
  }
}

export type RazorpayCheckoutInput = {
  key_id: string;
  order_id: string;
  amount?: number;
  currency?: string;
  name?: string;
  description?: string;
  environment?: string;
  plan?: { slug: string; name: string };
  prefill?: { name?: string; email?: string; contact?: string };
  payment_url?: string;
  short_url?: string;
};

export type RazorpayCheckoutResult = {
  order_id: string;
  payment_id: string;
  signature: string;
};

export async function openSubscriptionCheckout(
  checkout: RazorpayCheckoutInput
): Promise<RazorpayCheckoutResult> {
  const hosted =
    (checkout as { payment_url?: string; short_url?: string }).payment_url ||
    (checkout as { payment_url?: string; short_url?: string }).short_url;
  if (hosted && (!checkout.key_id || !checkout.order_id)) {
    if (!isAllowedPaymentRedirectUrl(hosted)) {
      throw new Error("Payment link is not from a trusted provider.");
    }
    window.location.assign(hosted);
    throw new Error("Redirecting to payment…");
  }

  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error("Razorpay checkout is unavailable");
  }
  if (!checkout.key_id || !checkout.order_id) {
    throw new Error("Razorpay checkout is incomplete. Please try again.");
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: checkout.key_id,
      amount: checkout.amount,
      currency: checkout.currency || "INR",
      name: checkout.name || "BW Rides",
      description: checkout.description || checkout.plan?.name || "Payment",
      order_id: checkout.order_id,
      prefill: checkout.prefill || {},
      theme: { color: "#B8D926" },
      handler: (response: {
        razorpay_order_id?: string;
        razorpay_payment_id?: string;
        razorpay_signature?: string;
      }) => {
        resolve({
          order_id: response.razorpay_order_id || checkout.order_id,
          payment_id: response.razorpay_payment_id || "",
          signature: response.razorpay_signature || "",
        });
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    });
    rzp.open();
  });
}
