"use client";

/** Professional ink + lime atmosphere for auth pages. */
export function LoginSceneDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#eef0ea]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_50%,rgba(17,20,17,0.08),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_100%_0%,rgba(198,227,26,0.14),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_40%_at_85%_90%,rgba(17,20,17,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.55)_0%,transparent_40%,rgba(17,20,17,0.03)_100%)]" />

      <div
        className="absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(17,20,17,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(17,20,17,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 70% 45%, black 10%, transparent 70%)",
        }}
      />

      <div className="absolute top-[12%] right-[18%] h-52 w-52 rounded-full bg-[#C6E31A]/10 blur-3xl" />
      <div className="absolute bottom-[8%] left-[6%] h-64 w-64 rounded-full bg-[#111411]/05 blur-3xl" />
    </div>
  );
}
