import { authFetch } from "@/lib/api";

function unwrapApiData<T>(res: unknown): T {
  if (res && typeof res === "object" && "data" in res) {
    const data = (res as { data?: T }).data;
    if (data !== undefined && data !== null) return data;
  }
  return res as T;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function extractPlanRows(res: unknown): Array<Record<string, unknown>> {
  const body = unwrapApiData<unknown>(res);
  if (Array.isArray(body)) return body as Array<Record<string, unknown>>;
  const record = asRecord(body);
  if (!record) return [];
  const nested =
    record.plans ??
    record.items ??
    record.results ??
    record.subscription_plans ??
    asRecord(record.data)?.plans;
  return Array.isArray(nested) ? (nested as Array<Record<string, unknown>>) : [];
}

export interface StudentPassApplication {
  id: string;
  aadhar_number: string;
  college_name: string;
  aadhar_photo_url?: string | null;
  student_id_photo_url?: string | null;
  status: string;
  discount_percent: number;
  rejection_reason?: string | null;
  verified_at?: string | null;
}

export type StudentPassPayload = {
  application: StudentPassApplication | null;
  discountPercent: number | null;
  message?: string;
};

function parseStudentPassApplication(value: unknown): StudentPassApplication | null {
  const record = asRecord(value);
  if (!record) return null;

  const nested = asRecord(record.application) ?? asRecord(record.student_pass);
  const row = nested ?? (typeof record.status === "string" ? record : null);
  if (!row) return null;

  const status = String(row.status ?? "").trim().toLowerCase();
  if (!status) return null;

  return {
    id: String(row.id ?? row.pass_id ?? ""),
    aadhar_number: String(row.aadhar_number ?? row.aadhaar_number ?? ""),
    college_name: String(row.college_name ?? row.college ?? ""),
    aadhar_photo_url:
      typeof row.aadhar_photo_url === "string"
        ? row.aadhar_photo_url
        : typeof row.aadhar_photo === "string"
          ? row.aadhar_photo
          : null,
    student_id_photo_url:
      typeof row.student_id_photo_url === "string"
        ? row.student_id_photo_url
        : typeof row.student_id_photo === "string"
          ? row.student_id_photo
          : null,
    status,
    discount_percent: Number(row.discount_percent ?? row.discount ?? 0) || 0,
    rejection_reason:
      typeof row.rejection_reason === "string"
        ? row.rejection_reason
        : typeof row.reason === "string"
          ? row.reason
          : null,
    verified_at: typeof row.verified_at === "string" ? row.verified_at : null,
  };
}

function parseStudentPassResponse(res: unknown): StudentPassPayload {
  const body = unwrapApiData<unknown>(res);
  const record = asRecord(body) ?? asRecord(res) ?? {};
  const application = parseStudentPassApplication(body) ?? parseStudentPassApplication(record);
  const discountRaw = record.discount_percent ?? record.discount ?? application?.discount_percent;
  const discountPercent =
    discountRaw === undefined || discountRaw === null || discountRaw === ""
      ? null
      : Number(discountRaw) || null;

  return {
    application,
    discountPercent,
    message: typeof record.message === "string" ? record.message : undefined,
  };
}

export async function getStudentPass(): Promise<StudentPassPayload> {
  try {
    return parseStudentPassResponse(
      await authFetch<unknown>("/student-pass", undefined, "Unable to load student pass"),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/not found|no student pass|404/i.test(message)) {
      return { application: null, discountPercent: null };
    }
    throw error;
  }
}

export async function submitStudentPass(payload: {
  aadhar_number: string;
  college_name: string;
  aadhar_photo: string;
  student_id_photo: string;
}): Promise<StudentPassPayload> {
  return parseStudentPassResponse(
    await authFetch<unknown>(
      "/student-pass",
      { method: "POST", body: JSON.stringify(payload) },
      "Unable to submit student pass",
    ),
  );
}

export function listSubscriptionPlans() {
  return authFetch<unknown>("/subscription-plans", undefined, "Unable to load subscription plans").then(
    (res) => ({ plans: extractPlanRows(res) }),
  );
}

export function getUserSubscription() {
  return authFetch<unknown>("/subscription", undefined, "Unable to load subscription").then((res) => {
    const body = unwrapApiData<unknown>(res);
    const record = asRecord(body) ?? asRecord(res) ?? {};
    const subscription =
      (record.subscription as Record<string, unknown> | null | undefined) ??
      (record.plan ? record : null);
    return { subscription: subscription ?? null };
  });
}

export function selectSubscriptionPlan(planSlug: string) {
  return authFetch<unknown>(
    "/subscription",
    {
      method: "POST",
      body: JSON.stringify({ plan_slug: planSlug }),
    },
    "Unable to update subscription",
  ).then((res) => {
    const body = unwrapApiData<Record<string, unknown>>(res);
    const record = asRecord(body) ?? asRecord(res) ?? {};
    return {
      subscription: (record.subscription ?? record) as {
        plan: {
          name: string;
          slug: string;
          benefits?: string[];
          ride_discount_percent?: number;
        };
        status: string;
      },
      message: String(record.message ?? "Plan updated"),
    };
  });
}

export interface SubscriptionCheckout {
  key_id: string;
  order_id: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  environment?: string;
  plan: { slug: string; name: string };
  prefill?: { name?: string; email?: string; contact?: string };
  payment_url?: string;
  short_url?: string;
}

function normalizeCheckout(res: unknown): SubscriptionCheckout {
  const body = unwrapApiData<unknown>(res);
  const record = asRecord(body) ?? {};
  const nested = asRecord(record.checkout) ?? record;
  const keyId = String(nested.key_id ?? nested.key ?? "");
  const orderId = String(nested.order_id ?? nested.razorpay_order_id ?? "");
  const paymentUrl = String(nested.payment_url ?? nested.short_url ?? nested.checkout_url ?? "");
  const planRecord = asRecord(nested.plan);
  return {
    key_id: keyId,
    order_id: orderId,
    amount: Number(nested.amount ?? 0),
    currency: String(nested.currency ?? "INR"),
    name: typeof nested.name === "string" ? nested.name : undefined,
    description: typeof nested.description === "string" ? nested.description : undefined,
    environment: typeof nested.environment === "string" ? nested.environment : undefined,
    plan: {
      slug: String(planRecord?.slug ?? ""),
      name: String(planRecord?.name ?? ""),
    },
    prefill: asRecord(nested.prefill) as SubscriptionCheckout["prefill"],
    payment_url: paymentUrl || undefined,
    short_url: typeof nested.short_url === "string" ? nested.short_url : undefined,
  };
}

export function createSubscriptionCheckout(planSlug: string, planId?: string) {
  return authFetch<unknown>(
    "/subscription/checkout",
    {
      method: "POST",
      body: JSON.stringify({
        plan_slug: planSlug,
        ...(planId && planId !== planSlug ? { plan_id: planId } : {}),
      }),
    },
    "Unable to start subscription payment",
  ).then((res) => ({ checkout: normalizeCheckout(res) }));
}

export function verifySubscriptionPayment(payload: {
  plan_slug: string;
  order_id: string;
  payment_id?: string;
  signature?: string;
}) {
  return authFetch<unknown>(
    "/subscription/verify-payment",
    { method: "POST", body: JSON.stringify(payload) },
    "Unable to verify subscription payment",
  ).then((res) => {
    const body = unwrapApiData<Record<string, unknown>>(res);
    const record = asRecord(body) ?? asRecord(res) ?? {};
    return {
      subscription: (record.subscription ?? record) as {
        plan: {
          name: string;
          slug: string;
          benefits?: string[];
          ride_discount_percent?: number;
        };
        status: string;
      },
      message: String(record.message ?? "Subscription activated"),
    };
  });
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  if (typeof window === "undefined") return dataUrl;

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    image.onerror = () => reject(new Error("Unable to process image"));
    image.src = dataUrl;
  });
}

export async function fileToUploadDataUrl(file: File | null) {
  if (!file) return null;
  try {
    return await compressImage(file);
  } catch {
    return fileToDataUrl(file);
  }
}

