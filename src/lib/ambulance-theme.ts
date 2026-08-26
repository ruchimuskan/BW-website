/** Emergency / ambulance booking surfaces — rose on cream, not lime ride theme. */

export const AMBULANCE_PAGE_BG = "bg-[#fff6f4]";

export const AMBULANCE_CTA =
  "bg-[#c45c5c] font-semibold text-white shadow-[0_14px_32px_-16px_rgba(160,50,45,0.5)] transition-[transform,background-color,box-shadow] duration-200 hover:bg-[#b04e4e] hover:shadow-[0_18px_36px_-16px_rgba(160,50,45,0.55)] active:scale-[0.99]";

export const ambulanceBookTheme = {
  pageBg: AMBULANCE_PAGE_BG,
  headerBorder: "border-[#ffd4cc]",
  headerBg: "bg-white/95",
  eyebrow: "text-[#c45c5c]",
  title: "text-[#4a1f1f]",
  backBtn:
    "border-[#ffd4cc] bg-white text-[#4a1f1f] hover:border-[#c45c5c]/40 hover:bg-[#fff6f4]",
  card: "border-[#ffd4cc] bg-white",
  muted: "text-[#7a4545]",
  ink: "text-[#4a1f1f]",
  mapShell: "bg-[#4a1f1f]",
  footerBorder: "border-[#ffd4cc]",
  footerBtn:
    "border-[#ffd4cc] bg-white text-[#4a1f1f] hover:border-[#c45c5c]/40 hover:bg-[#fff6f4]",
  selected:
    "border-[#c45c5c]/45 bg-white shadow-[0_12px_28px_-18px_rgba(160,50,45,0.28)] ring-1 ring-[#c45c5c]/25",
  idle: "border-[#ffd4cc] hover:border-[#c45c5c]/35 hover:bg-white",
  check: "bg-[#c45c5c] text-white",
  dropDot: "bg-[#c45c5c] ring-[#c45c5c]/20",
  input:
    "border-[#ffd4cc] bg-white text-[#4a1f1f] placeholder:text-[#9a6a6a] focus:border-[#c45c5c]/50 focus:ring-[#c45c5c]/20",
  cta: AMBULANCE_CTA,
  ctaDisabled: "bg-[#f3d6d2] text-[#9a6a6a]",
} as const;

export const rideBookTheme = {
  pageBg: "bg-[#f7fbe8]",
  headerBorder: "border-[#e8f0c8]",
  headerBg: "bg-white/95",
  eyebrow: "text-[#B8D926]",
  title: "text-[#38471B]",
  backBtn:
    "border-[#e8f0c8] bg-white text-[#38471B] hover:border-[#B8D926]/50 hover:bg-[#f7fbe8]",
  card: "border-[#e8f0c8] bg-white",
  muted: "text-[#5a6330]",
  ink: "text-[#38471B]",
  mapShell: "bg-[#38471B]",
  footerBorder: "border-[#e8f0c8]",
  footerBtn:
    "border-[#e8f0c8] bg-white text-[#38471B] hover:border-[#B8D926]/45 hover:bg-[#f7fbe8]",
  selected:
    "border-[#B8D926]/45 bg-white shadow-[0_12px_28px_-18px_rgba(56,71,27,0.28)] ring-1 ring-[#B8D926]/25",
  idle: "border-[#e8f0c8] hover:border-[#B8D926]/35 hover:bg-white",
  check: "bg-[#B8D926] text-[#38471B]",
  dropDot: "bg-[#B8D926] ring-[#B8D926]/20",
  input:
    "border-primary/12 bg-white text-[#38471B] placeholder:text-[#7a8448] focus:border-primary/35 focus:ring-primary/15",
  cta: "",
  ctaDisabled: "bg-[#e8f0c8] text-[#5a6330]/70",
} as const;

export const ambulanceLocationTheme = {
  pageBg: "bg-[#fff6f4]",
  panelBorder: "border-[#ffd4cc]",
  panelShadow: "shadow-[0_-16px_48px_-24px_rgba(160,50,45,0.28)]",
  desktopShadow: "lg:shadow-[8px_0_40px_-28px_rgba(160,50,45,0.28)]",
  grabber: "bg-[#f0c4bc]",
  headerBg: "bg-[#4a1f1f]",
  headerBorder: "border-[#6a3030]",
  eyebrow: "text-[#ffb8ae]/90",
  title: "text-white",
  backBtn:
    "border-white/15 bg-white/10 text-white hover:bg-white/18 focus-visible:ring-[#ffb8ae]/55",
  inputRing: "focus-within:ring-[#c45c5c]/45",
  inputText: "text-[#4a1f1f] placeholder:text-[#9a6a6a]",
  searchIcon: "text-[#c45c5c]",
  hint: "text-white/70",
  bodyBg: "bg-[#fff6f4]",
  card: "border-[#ffd4cc] bg-white",
  cardHover: "hover:border-[#c45c5c]/40 hover:bg-[#fff8f5]",
  iconBox: "bg-[#4a1f1f] text-[#ffb8ae]",
  ink: "text-[#4a1f1f]",
  muted: "text-[#7a4545]",
  spinner: "text-[#c45c5c]",
  sectionIcon: "text-[#c45c5c]",
  sectionTitle: "text-[#7a4545]",
  rowHover: "hover:bg-[#fff8f5] active:bg-[#fff0ee]",
  rowDivider: "divide-[#ffe8e2]",
  distance: "bg-[#fff0ee] text-[#7a4545]",
  mapOverlay: "from-[#4a1f1f]/45",
  mapOverlayBottom: "from-[#4a1f1f]/40",
  mapBadge: "border-white/15 bg-[#4a1f1f]/88",
  mapDot: "bg-[#c45c5c]",
  mapFallback: "bg-[#4a1f1f]",
} as const;

export const rideLocationTheme = {
  pageBg: "bg-[#f5f6f2]",
  panelBorder: "border-[#e5e7df]",
  panelShadow: "shadow-[0_-16px_48px_-24px_rgba(40,54,20,0.35)]",
  desktopShadow: "lg:shadow-[8px_0_40px_-28px_rgba(40,54,20,0.35)]",
  grabber: "bg-[#d9dece]",
  headerBg: "bg-[#283614]",
  headerBorder: "border-[#eef1e6]",
  eyebrow: "text-[#C8E84A]/90",
  title: "text-white",
  backBtn:
    "border-white/15 bg-white/10 text-white hover:bg-white/18 focus-visible:ring-[#C8E84A]/55",
  inputRing: "focus-within:ring-[#C8E84A]/40",
  inputText: "text-[#1f2912] placeholder:text-[#8a9270]",
  searchIcon: "text-[#8a9270]",
  hint: "text-white/65",
  bodyBg: "bg-[#f5f6f2]",
  card: "border-[#e5e7df] bg-white",
  cardHover: "hover:border-[#c9d4a8] hover:bg-[#fafaf7]",
  iconBox: "bg-[#38471B] text-[#C8E84A]",
  ink: "text-[#1f2912]",
  muted: "text-[#5a6330]",
  spinner: "text-[#9BB820]",
  sectionIcon: "text-[#6B7A14]",
  sectionTitle: "text-[#4A5824]",
  rowHover: "hover:bg-[#f7f8f3] active:bg-[#f0f2ea]",
  rowDivider: "divide-[#eef1e6]",
  distance: "bg-[#f0f2ea] text-[#4A5824]",
  mapOverlay: "from-[#283614]/45",
  mapOverlayBottom: "from-[#283614]/40",
  mapBadge: "border-white/15 bg-[#283614]/88",
  mapDot: "bg-[#C8E84A]",
  mapFallback: "bg-[#283614]",
} as const;
