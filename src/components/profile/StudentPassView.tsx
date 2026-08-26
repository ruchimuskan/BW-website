"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BadgePercent,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileUp,
  GraduationCap,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";
import { SettingsPageLayout } from "@/components/layout/SettingsPageLayout";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  clearAuthSession,
  requireAuthRedirect,
  setPostLoginRedirect,
} from "@/lib/auth-session";
import {
  fileToUploadDataUrl,
  getStudentPass,
  submitStudentPass,
  type StudentPassApplication,
} from "@/lib/membership-api";
import {
  getAadhaarValidationError,
  getIdPhotoValidationError,
} from "@/lib/student-pass-validation";

function isAuthTokenError(message: string) {
  return /invalid|expired|token|unauthorized|unauthenticated|401/i.test(message);
}

function formatCollegeName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b([a-z])/g, (letter) => letter.toUpperCase());
}

function maskAadhaar(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length < 4) return null;
  return `XXXX XXXX ${digits.slice(-4)}`;
}

function StudentPassHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#38471B]/10 bg-[#38471B] text-white shadow-[0_24px_50px_-28px_rgba(40,54,20,0.5)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_100%_0%,rgba(200,232,74,0.28),transparent_55%)]"
      />
      <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:gap-5 sm:p-7">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
          <GraduationCap className="h-6 w-6 text-[#C8E84A]" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-[#C8E84A]/90 uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
            {title}
          </h2>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/75">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

export function StudentPassView() {
  const router = useRouter();
  const [application, setApplication] = useState<StudentPassApplication | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [aadharNumber, setAadharNumber] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [aadharPhoto, setAadharPhoto] = useState<File | null>(null);
  const [studentIdPhoto, setStudentIdPhoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [popup, setPopup] = useState<{ title: string; message: string } | null>(null);

  const showPopup = (title: string, message: string) => {
    setPopup({ title, message });
  };

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await getStudentPass();
        if (cancelled) return;
        setApplication(data.application);
        setDiscountPercent(data.discountPercent);
        if (data.application?.status === "rejected") {
          setAadharNumber(data.application.aadhar_number?.replace(/\D/g, "").slice(0, 12) ?? "");
          setCollegeName(data.application.college_name ?? "");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to load student pass";

        if (isAuthTokenError(message)) {
          clearAuthSession();
          setPostLoginRedirect(ROUTES.profileStudentPass);
          router.replace(requireAuthRedirect(ROUTES.profileStudentPass));
          return;
        }

        if (!cancelled) setLoadError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const aadhaarError = getAadhaarValidationError(aadharNumber);
    if (aadhaarError) {
      showPopup("Invalid Aadhar number", aadhaarError);
      return;
    }
    if (collegeName.trim().length < 3) {
      showPopup("Invalid college name", "Enter your full college or university name.");
      return;
    }
    if (!aadharPhoto) {
      showPopup("Aadhar card photo required", "Upload a clear photo of your Aadhar card.");
      return;
    }
    if (!studentIdPhoto) {
      showPopup("Student ID photo required", "Upload a clear photo of your student ID card.");
      return;
    }

    const aadharPhotoError = await getIdPhotoValidationError(aadharPhoto, "aadhar");
    if (aadharPhotoError) {
      setAadharPhoto(null);
      showPopup("Invalid Aadhar card photo", aadharPhotoError);
      return;
    }
    const studentIdError = await getIdPhotoValidationError(studentIdPhoto, "student_id");
    if (studentIdError) {
      setStudentIdPhoto(null);
      showPopup("Invalid student ID photo", studentIdError);
      return;
    }

    setSubmitting(true);
    try {
      const aadharDataUrl = await fileToUploadDataUrl(aadharPhoto);
      const studentIdDataUrl = await fileToUploadDataUrl(studentIdPhoto);
      if (!aadharDataUrl || !studentIdDataUrl) {
        throw new Error("Unable to process images");
      }

      const result = await submitStudentPass({
        aadhar_number: aadharNumber.trim(),
        college_name: collegeName.trim(),
        aadhar_photo: aadharDataUrl,
        student_id_photo: studentIdDataUrl,
      });
      setApplication(result.application);
      setDiscountPercent(result.discountPercent ?? result.application?.discount_percent ?? discountPercent);
      setSuccess(result.message || "Submitted for verification.");
      setAadharPhoto(null);
      setStudentIdPhoto(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submission failed";
      if (isAuthTokenError(message)) {
        clearAuthSession();
        setPostLoginRedirect(ROUTES.profileStudentPass);
        router.replace(requireAuthRedirect(ROUTES.profileStudentPass));
        return;
      }
      setError(message);
      showPopup("Could not submit", message);
    } finally {
      setSubmitting(false);
    }
  };

  const offLabel =
    (discountPercent ?? application?.discount_percent)
      ? `Get ${discountPercent ?? application?.discount_percent}% off every ride`
      : "Student discounts on every ride";

  if (loading) {
    return (
      <SettingsPageLayout title="Student Pass" backHref={ROUTES.profile} wide>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 rounded-3xl border border-[#e8f0c8] bg-white/80 text-[#5a6330]">
          <Loader2 className="h-6 w-6 animate-spin text-[#B8D926]" />
          <p className="text-sm">Loading your Student Pass…</p>
        </div>
      </SettingsPageLayout>
    );
  }

  if (loadError) {
    return (
      <SettingsPageLayout title="Student Pass" backHref={ROUTES.profile} wide>
        <div className="mx-auto w-full max-w-lg rounded-3xl border border-destructive/15 bg-white p-6 text-center shadow-sm sm:p-8">
          <p className="text-sm font-medium text-destructive">{loadError}</p>
          <Button
            type="button"
            className="mt-5 h-11 rounded-full bg-[#B8D926] text-[#38471B]"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </SettingsPageLayout>
    );
  }

  if (application?.status === "approved") {
    const college = application.college_name
      ? formatCollegeName(application.college_name)
      : null;
    return (
      <SettingsPageLayout title="Student Pass" backHref={ROUTES.profile} wide>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 sm:gap-6">
          <StudentPassHero
            eyebrow="Verified"
            title="Your Student Pass is active"
            description={
              application.discount_percent
                ? `Student fare is on. You get ${application.discount_percent}% off eligible rides.`
                : "Student fare is on for eligible rides."
            }
          />
          <div className="rounded-3xl border border-[#e8f0c8] bg-white p-5 shadow-[0_16px_36px_-28px_rgba(56,71,27,0.35)] sm:p-7">
            <div className="flex items-start gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">
                  Approved
                </p>
                <h3 className="mt-1 font-heading text-xl font-semibold text-[#283614]">
                  Discount applied automatically
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#5a6330]">
                  Book a ride as usual. The student rate is used at checkout when
                  the trip is eligible.
                </p>
              </div>
            </div>
            {college ? (
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f7fbe8] px-4 py-3">
                  <dt className="text-[11px] font-semibold tracking-wide text-[#5a6330] uppercase">
                    Institution
                  </dt>
                  <dd className="mt-1 break-words text-sm font-semibold text-[#283614]">
                    {college}
                  </dd>
                </div>
                {application.discount_percent ? (
                  <div className="rounded-2xl bg-[#f7fbe8] px-4 py-3">
                    <dt className="text-[11px] font-semibold tracking-wide text-[#5a6330] uppercase">
                      Ride discount
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-[#283614]">
                      {application.discount_percent}% off eligible rides
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
            <Button
              type="button"
              className="mt-6 h-11 w-full rounded-xl bg-[#38471B] font-semibold text-white hover:bg-[#4A5824] sm:w-auto sm:px-6"
              onClick={() => router.push(ROUTES.home)}
            >
              Book a ride
            </Button>
          </div>
        </div>
      </SettingsPageLayout>
    );
  }

  if (application?.status === "pending") {
    const college = application.college_name
      ? formatCollegeName(application.college_name)
      : null;
    const aadhaar = maskAadhaar(application.aadhar_number);
    return (
      <SettingsPageLayout title="Student Pass" backHref={ROUTES.profile} wide>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 sm:gap-6">
          <StudentPassHero
            eyebrow="Application received"
            title="Verification pending"
            description="Our team is reviewing your documents. Eligible student fares go live as soon as this is approved."
          />

          <div className="rounded-3xl border border-[#e8f0c8] bg-white p-5 shadow-[0_16px_36px_-28px_rgba(56,71,27,0.35)] sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0f5dc] text-[#B8D926]">
                <Clock3 className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="inline-flex rounded-full bg-[#C8E84A]/25 px-2.5 py-1 text-[11px] font-semibold text-[#38471B]">
                  Under review
                </span>
                <h3 className="mt-2 font-heading text-xl font-semibold text-[#283614] sm:text-2xl">
                  Documents submitted
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#5a6330]">
                  {college
                    ? `Your Student Pass for ${college} is with our verification team.`
                    : "Your Student Pass application is with our verification team."}
                </p>
              </div>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {college ? (
                <div className="rounded-2xl border border-[#eef5d4] bg-[#fbfdf4] px-4 py-3">
                  <dt className="text-[11px] font-semibold tracking-wide text-[#5a6330] uppercase">
                    College / university
                  </dt>
                  <dd className="mt-1 break-words text-sm font-semibold text-[#283614]">
                    {college}
                  </dd>
                </div>
              ) : null}
              {aadhaar ? (
                <div className="rounded-2xl border border-[#eef5d4] bg-[#fbfdf4] px-4 py-3">
                  <dt className="text-[11px] font-semibold tracking-wide text-[#5a6330] uppercase">
                    Aadhaar on file
                  </dt>
                  <dd className="mt-1 text-sm font-semibold tabular-nums text-[#283614]">
                    {aadhaar}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: FileUp,
                title: "1. Submitted",
                body: "ID and Aadhaar photos received.",
                done: true,
              },
              {
                icon: ShieldCheck,
                title: "2. Review",
                body: "Admin checks that details match.",
                done: true,
              },
              {
                icon: BadgePercent,
                title: "3. Discount",
                body: "Student fare unlocks after approval.",
                done: false,
              },
            ].map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-[#e8f0c8] bg-white p-4 sm:p-5"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    step.done ? "bg-[#f0f5dc] text-[#38471B]" : "bg-[#f4f4f0] text-[#8a9170]"
                  }`}
                >
                  <step.icon className="h-4 w-4" />
                </span>
                <p className="mt-3 text-sm font-semibold text-[#283614]">{step.title}</p>
                <p className="mt-1 text-xs leading-5 text-[#5a6330]">{step.body}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs leading-5 text-[#5a6330] sm:text-sm">
            Reviews usually finish within 24–48 hours. You can keep booking rides
            at standard fares until then.
          </p>
        </div>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout title="Student Pass" backHref={ROUTES.profile} wide>
      <div className="mx-auto w-full max-w-3xl">
        <StudentPassHero
          eyebrow="Student fares"
          title={offLabel}
          description="Submit Aadhaar and student ID. After admin approval, the discount applies on eligible rides."
        />

        {application?.status === "rejected" && application.rejection_reason ? (
          <p className="mt-5 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {application.rejection_reason}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 rounded-3xl border border-[#e8f0c8] bg-white p-4 shadow-[0_16px_36px_-28px_rgba(56,71,27,0.35)] sm:mt-6 sm:space-y-5 sm:p-6">
          <div className="space-y-1.5">
            <label htmlFor="aadhar" className="text-sm font-semibold text-[#38471B]">
              Aadhar number
            </label>
            <input
              id="aadhar"
              value={aadharNumber}
              onChange={(e) =>
                setAadharNumber(e.target.value.replace(/\D/g, "").slice(0, 12))
              }
              onBlur={() => {
                if (!aadharNumber) return;
                const aadhaarError = getAadhaarValidationError(aadharNumber);
                if (aadhaarError) showPopup("Invalid Aadhar number", aadhaarError);
              }}
              placeholder="Enter 12-digit Aadhar number"
              inputMode="numeric"
              autoComplete="off"
              className="h-12 w-full rounded-2xl border border-[#ece7d8] bg-[#fbf8f1] px-4 text-sm text-[#38471B] outline-none transition placeholder:text-[#8a9170] focus:border-[#C8E84A] focus:bg-white focus:ring-2 focus:ring-[#C8E84A]/20 sm:h-12"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="college" className="text-sm font-semibold text-[#38471B]">
              College name
            </label>
            <input
              id="college"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value.slice(0, 200))}
              placeholder="Enter your college or university name"
              className="h-12 w-full rounded-2xl border border-[#ece7d8] bg-[#fbf8f1] px-4 text-sm text-[#38471B] outline-none transition placeholder:text-[#8a9170] focus:border-[#C8E84A] focus:bg-white focus:ring-2 focus:ring-[#C8E84A]/20"
            />
          </div>

          <UploadRow
            id="aadharPhoto"
            label="Aadhar card photo"
            file={aadharPhoto}
            existingUrl={application?.aadhar_photo_url}
            onChange={setAadharPhoto}
            onInvalid={(message) => {
              setAadharPhoto(null);
              showPopup("Invalid Aadhar card photo", message);
            }}
            kind="aadhar"
          />

          <UploadRow
            id="studentIdPhoto"
            label="Student ID card photo"
            file={studentIdPhoto}
            existingUrl={application?.student_id_photo_url}
            onChange={setStudentIdPhoto}
            onInvalid={(message) => {
              setStudentIdPhoto(null);
              showPopup("Invalid student ID photo", message);
            }}
            kind="student_id"
          />

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {success ? (
            <p className="text-sm font-medium text-emerald-700">{success}</p>
          ) : null}

          <Button
            type="submit"
            className="h-12 w-full rounded-[16px] bg-[#B8D926] text-base font-semibold text-[#38471B] shadow-md hover:bg-[#C8E84A]"
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Submit for verification"}
          </Button>
        </form>
      </div>
      {popup ? (
        <ValidationPopup
          title={popup.title}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      ) : null}
    </SettingsPageLayout>
  );
}

function UploadRow({
  id,
  label,
  file,
  existingUrl,
  onChange,
  onInvalid,
  kind,
}: {
  id: string;
  label: string;
  file: File | null;
  existingUrl?: string | null;
  onChange: (file: File | null) => void;
  onInvalid: (message: string) => void;
  kind: "aadhar" | "student_id";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(existingUrl || null);

  useEffect(() => {
    if (!file) {
      setPreview(existingUrl || null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file, existingUrl]);

  const caption = file
    ? file.name
    : existingUrl
      ? "Uploaded — tap to replace"
      : "Tap to upload image.";

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={async (e) => {
          const next = e.target.files?.[0] ?? null;
          e.target.value = "";
          if (!next) {
            onChange(null);
            return;
          }
          const invalid = await getIdPhotoValidationError(next, kind);
          if (invalid) {
            onInvalid(invalid);
            return;
          }
          onChange(next);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center gap-3 rounded-2xl border border-[#e6e0d2] bg-white px-3.5 py-3.5 text-left shadow-sm transition hover:border-[#C8E84A]/60 sm:px-4"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#eef6c8] text-[#5a6330]">
          {preview ? (
            // Local blob preview — next/image does not support blob: reliably here.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <FileUp className="h-5 w-5" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-[#38471B]">{label}</span>
          <span className="mt-0.5 block truncate text-xs text-[#8a9170]">{caption}</span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-[#c5cbb0]" />
      </button>
    </div>
  );
}

function ValidationPopup({
  title,
  message,
  onClose,
}: {
  title: string;
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="student-pass-alert-title"
        aria-describedby="student-pass-alert-desc"
        className="w-full max-w-sm rounded-2xl border border-[#ece7d8] bg-white p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 id="student-pass-alert-title" className="font-heading text-base font-semibold text-[#38471B]">
              {title}
            </h3>
            <p id="student-pass-alert-desc" className="mt-1.5 text-sm leading-relaxed text-[#5a6330]">
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-[#8a9170] hover:bg-[#f4f9e4]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <Button
          type="button"
          className="mt-5 h-11 w-full rounded-xl bg-[#B8D926] font-semibold text-[#38471B] hover:bg-[#C8E84A]"
          onClick={onClose}
        >
          OK
        </Button>
      </div>
    </div>
  );
}
