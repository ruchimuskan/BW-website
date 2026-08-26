"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Loader2,
  Mic,
  MicOff,
  ShieldCheck,
  Sparkles,
  Timer,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BW_RIDES_LOGO_SRC } from "@/components/layout/WaveGoLogo";
import {
  sendAiChatMessage,
  type AiChatMessage,
} from "@/lib/ai-chat-api";
import { getAiFeatureFallback } from "@/lib/ai-feature-fallbacks";
import { chatFabOffsetClass, isChatWidgetPath } from "@/lib/chat-widget";
import { cn } from "@/lib/utils";

/** Circular brand mark — masks square PNG / white corners. */
function ChatBotLogo({
  size = "md",
  className,
  priority = false,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
}) {
  const dims =
    size === "sm"
      ? { box: "h-7 w-7", pad: "p-1", img: 18 }
      : size === "lg"
        ? { box: "h-full w-full", pad: "p-1.5", img: 40 }
        : { box: "h-11 w-11", pad: "p-[7px]", img: 32 };

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f4f8e4] ring-2 ring-[#C8E84A]/55",
        dims.box,
        dims.pad,
        className,
      )}
    >
      <Image
        src={BW_RIDES_LOGO_SRC}
        alt=""
        width={dims.img}
        height={dims.img}
        priority={priority}
        className="h-full w-full object-contain mix-blend-multiply"
      />
    </span>
  );
}

/** Browser SpeechRecognition (Chrome / Edge / Safari variants). */
type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike> & { length: number };
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

/** Prefer a female Indian / Hindi English voice for TTS. */
function pickIndianFemaleVoice(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const score = (voice: SpeechSynthesisVoice): number => {
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();
    let points = 0;

    if (lang === "en-in") points += 50;
    else if (lang.startsWith("en-in")) points += 45;
    else if (lang === "hi-in" || lang.startsWith("hi")) points += 35;
    else if (lang.startsWith("en")) points += 10;

    // Known female Indian / Indian-English voice names across Chrome, Edge, macOS
    if (
      /heera|neerja|priya|raveena|aditi|veena|swara|ananya|isha|kavya|meera|indian.*female|female.*indian/.test(
        name
      )
    ) {
      points += 40;
    }
    if (/female|woman|zira|samantha|karen|moira|tessa|fiona/.test(name)) {
      points += 8;
    }
    if (/male|david|ravi|prabhat|hemant|mark|daniel/.test(name)) {
      points -= 30;
    }
    if (voice.localService) points += 2;
    return points;
  };

  return [...voices].sort((a, b) => score(b) - score(a))[0] ?? null;
}

const WELCOME: AiChatMessage = {
  role: "assistant",
  content:
    "Hi — I’m Bullwave Assistant.\n\nI can help you with:\n• App features\n• Safety & SOS\n• Women Safety\n• Fare estimates (share 2 places or distance in km)",
};

type QuickAction = "features" | "women-safety" | "fare";

type FollowUpQuestion = {
  label: string;
  question: string;
};

const TOPIC_QUESTIONS: Record<
  QuickAction,
  { title: string; intro: string; questions: FollowUpQuestion[] }
> = {
  features: {
    title: "Features",
    intro: "Choose a question about Bull Wave Rides features:",
    questions: [
      {
        label: "What services do you offer?",
        question:
          "What services and features does Bull Wave Rides offer for riders?",
      },
      {
        label: "How does booking work?",
        question: "How does ride booking work on Bull Wave Rides?",
      },
      {
        label: "Parcel & Ambulance?",
        question:
          "How do Parcel delivery and Ambulance emergency services work on Bull Wave Rides?",
      },
      {
        label: "Wallet & payments?",
        question:
          "How do Wallet, payments, coupons, and subscriptions work on Bull Wave Rides?",
      },
      {
        label: "AI smart features?",
        question:
          "What are the AI smart features on Bull Wave Rides like Fare Predictor, Route Optimizer, and Safety Monitor?",
      },
    ],
  },
  "women-safety": {
    title: "Women Safety",
    intro: "Choose a question about women safety:",
    questions: [
      {
        label: "What is Women Safety Mode?",
        question: "What is Women Safety Mode on Bull Wave Rides and how does it work?",
      },
      {
        label: "Prefer Women Captains?",
        question:
          "How does Prefer Women Captains work, and what if no women captains are nearby?",
      },
      {
        label: "How does SOS work?",
        question:
          "How does SOS work during a ride for women safety on Bull Wave Rides?",
      },
      {
        label: "Emergency contact?",
        question:
          "Why should I add an emergency contact, and how is it used in Women Safety?",
      },
    ],
  },
  fare: {
    title: "Fare",
    intro: "Choose a question about fares:",
    questions: [
      {
        label: "Are fares affordable?",
        question:
          "Are Bull Wave Rides fares affordable and transparent? Explain how pricing works for riders.",
      },
      {
        label: "How is fare calculated?",
        question:
          "How is ride fare calculated on Bull Wave Rides? Explain base fare, included km, and per-km charges.",
      },
      {
        label: "Fare for 10 km?",
        question: "What is the fare for a 10 km ride on bike, auto, and cab?",
      },
      {
        label: "Night charges?",
        question: "When do night charges apply on Bull Wave Rides fares?",
      },
    ],
  },
};

const QUICK_ACTIONS: {
  id: QuickAction;
  label: string;
  icon: typeof Sparkles;
}[] = [
  { id: "features", label: "Features", icon: Sparkles },
  { id: "women-safety", label: "Women Safety", icon: ShieldCheck },
  { id: "fare", label: "Fare", icon: Timer },
];

function cleanReplyText(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function textForSpeech(text: string): string {
  return cleanReplyText(text)
    .replace(/[•]/g, ",")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600);
}

function formatMessage(text: string) {
  const cleaned = cleanReplyText(text);
  return cleaned.split("\n").map((line, index) => (
    <span key={`${index}-${line.slice(0, 12)}`}>
      {line}
      {index < cleaned.split("\n").length - 1 ? <br /> : null}
    </span>
  ));
}

export function FloatingChatWidget() {
  const pathname = usePathname() || "/";
  const [showWidget, setShowWidget] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([WELCOME]);
  const [activeTopic, setActiveTopic] = useState<QuickAction | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [listening, setListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [voiceHint, setVoiceHint] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  /** Hands-free loop: keep listening after each spoken reply until user stops mic. */
  const voiceModeRef = useRef(false);
  const pendingTranscriptRef = useRef("");
  const sentFromVoiceRef = useRef(false);
  const messagesRef = useRef(messages);
  const busyRef = useRef(busy);
  const voiceEnabledRef = useRef(voiceEnabled);
  const askRef = useRef<(text: string, displayAs?: string) => Promise<void>>(
    async () => undefined
  );

  messagesRef.current = messages;
  busyRef.current = busy;
  voiceEnabledRef.current = voiceEnabled;

  useEffect(() => {
    const allowed = isChatWidgetPath(pathname);
    setShowWidget(allowed);
    if (!allowed) setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const Recognition = getSpeechRecognitionCtor();
    setSpeechSupported(Boolean(Recognition));
    setTtsSupported(
      typeof window !== "undefined" && "speechSynthesis" in window
    );

    const loadVoices = () => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }
      voiceRef.current = pickIndianFemaleVoice(window.speechSynthesis.getVoices());
    };
    loadVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      }
      voiceModeRef.current = false;
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!open) {
      voiceModeRef.current = false;
      pendingTranscriptRef.current = "";
      sentFromVoiceRef.current = false;
      recognitionRef.current?.abort();
      setListening(false);
      setVoiceMode(false);
      window.speechSynthesis?.cancel();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 180);
    return () => window.clearTimeout(timer);
  }, [open, messages, busy, activeTopic, listening]);

  function speakAssistant(text: string): Promise<void> {
    // Voice output only while mic / voice mode is active
    if (!voiceModeRef.current || !voiceEnabledRef.current) {
      return Promise.resolve();
    }
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return Promise.resolve();
    }

    const spoken = textForSpeech(text);
    if (!spoken) return Promise.resolve();

    window.speechSynthesis.cancel();

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(spoken);
      utterance.lang = "en-IN";
      utterance.rate = 0.95;
      utterance.pitch = 1.08;
      const preferred = voiceRef.current;
      if (preferred) {
        utterance.voice = preferred;
        utterance.lang = preferred.lang || "en-IN";
      }
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      utterance.onend = finish;
      utterance.onerror = finish;
      // Some browsers drop the first speak() after cancel — retry once.
      window.setTimeout(() => {
        window.speechSynthesis.speak(utterance);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }, 40);
      // Safety timeout so voice-mode listening can resume
      window.setTimeout(finish, Math.min(20000, spoken.length * 80 + 2500));
    });
  }

  function stopVoiceMode() {
    voiceModeRef.current = false;
    pendingTranscriptRef.current = "";
    sentFromVoiceRef.current = false;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setListening(false);
    setVoiceMode(false);
    window.speechSynthesis?.cancel();
  }

  function submitVoiceTranscript(raw: string) {
    const cleaned = raw.trim();
    if (!cleaned || busyRef.current || sentFromVoiceRef.current) return;
    sentFromVoiceRef.current = true;
    pendingTranscriptRef.current = "";
    setInput("");
    setVoiceHint("Sending…");
    void askRef.current(cleaned);
  }

  function startListening() {
    const Recognition = getSpeechRecognitionCtor();
    if (!Recognition) {
      setVoiceHint("Voice input isn’t supported in this browser.");
      return;
    }
    if (busyRef.current) return;

    // Pause bot speech so mic can hear the user clearly
    window.speechSynthesis?.cancel();
    voiceModeRef.current = true;
    setVoiceMode(true);
    pendingTranscriptRef.current = "";
    sentFromVoiceRef.current = false;
    setVoiceHint("Listening… your message will send automatically");

    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    const recognition = new Recognition();
    // Indian English + Hindi/Hinglish recognition
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setVoiceHint("Listening… your message will send automatically");
    };

    recognition.onresult = (event) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const piece = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) finalChunk += piece;
        else interimChunk += piece;
      }

      if (finalChunk.trim()) {
        pendingTranscriptRef.current = [
          pendingTranscriptRef.current,
          finalChunk.trim(),
        ]
          .filter(Boolean)
          .join(" ")
          .trim();
      }

      const display = (
        pendingTranscriptRef.current || interimChunk || finalChunk
      ).trim();
      if (display) setInput(display);

      // Final result → send immediately (no Send button)
      if (finalChunk.trim()) {
        submitVoiceTranscript(pendingTranscriptRef.current || finalChunk);
      }
    };

    recognition.onerror = (event) => {
      setListening(false);
      if (event.error === "not-allowed") {
        voiceModeRef.current = false;
        setVoiceMode(false);
        setVoiceHint("Microphone access is blocked. Please allow permission to continue.");
      } else if (event.error === "no-speech") {
        setVoiceHint("No speech detected. Please try again.");
      } else if (event.error !== "aborted") {
        setVoiceHint("We couldn’t hear that. Tap the mic and try again.");
      }
    };

    recognition.onend = () => {
      setListening(false);

      // If browser ended without isFinal, still auto-send what we heard
      if (
        voiceModeRef.current &&
        !busyRef.current &&
        !sentFromVoiceRef.current &&
        pendingTranscriptRef.current.trim()
      ) {
        submitVoiceTranscript(pendingTranscriptRef.current);
        return;
      }

      // Keep listening in hands-free mode while idle (no reply in flight)
      if (
        voiceModeRef.current &&
        !busyRef.current &&
        !sentFromVoiceRef.current &&
        !window.speechSynthesis?.speaking
      ) {
        window.setTimeout(() => {
          if (
            voiceModeRef.current &&
            !busyRef.current &&
            !sentFromVoiceRef.current
          ) {
            try {
              recognition.start();
            } catch {
              // recreate session if start() rejects after end
              startListening();
            }
          }
        }, 280);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setListening(false);
      voiceModeRef.current = false;
      setVoiceMode(false);
      setVoiceHint("Couldn’t start the microphone. Try again.");
    }
  }

  function toggleListening() {
    if (listening || voiceMode) {
      stopVoiceMode();
      window.speechSynthesis?.cancel();
      setVoiceHint(null);
      return;
    }
    startListening();
  }

  async function ask(text: string, displayAs?: string) {
    const cleaned = text.trim();
    if (!cleaned || busyRef.current) return;

    // Stop mic while we fetch + speak the reply
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setListening(false);
    window.speechSynthesis?.cancel();

    const prior = messagesRef.current;
    const nextUser: AiChatMessage = {
      role: "user",
      content: (displayAs || cleaned).trim(),
    };
    setMessages((prev) => [...prev, nextUser]);
    setInput("");
    setBusy(true);
    setVoiceHint(voiceModeRef.current ? "Processing your request…" : null);

    let content = "";
    try {
      const reply = await sendAiChatMessage(cleaned, prior);
      content = cleanReplyText(reply);
    } catch {
      content = cleanReplyText(getAiFeatureFallback(cleaned));
    }

    setMessages((prev) => [...prev, { role: "assistant", content }]);
    setBusy(false);

    // Speak reply only when mic / voice mode is on
    if (voiceModeRef.current && voiceEnabledRef.current) {
      setVoiceHint("Playing response…");
      await speakAssistant(content);
    }

    sentFromVoiceRef.current = false;
    pendingTranscriptRef.current = "";

    // Hands-free: after reply is spoken, listen again automatically
    if (voiceModeRef.current) {
      setVoiceHint("Listening… your message will send automatically");
      startListening();
    } else {
      setVoiceHint(null);
    }
  }

  askRef.current = ask;

  function onQuickAction(id: QuickAction) {
    if (busy) return;
    const topic = TOPIC_QUESTIONS[id];
    setActiveTopic(id);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: topic.title },
      { role: "assistant", content: topic.intro },
    ]);
    if (voiceModeRef.current) {
      void speakAssistant(topic.intro).then(() => {
        if (voiceModeRef.current) startListening();
      });
    }
  }

  function onQuestionClick(item: FollowUpQuestion) {
    if (busy) return;
    void ask(item.question, item.label);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(input);
  }

  function toggleVoiceOutput() {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    voiceEnabledRef.current = next;
    if (!next) window.speechSynthesis?.cancel();
  }

  const followUps = activeTopic ? TOPIC_QUESTIONS[activeTopic].questions : [];

  if (!showWidget) {
    return null;
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed right-3 z-[90] flex flex-col items-end gap-3 sm:right-4 lg:right-7",
        chatFabOffsetClass(pathname),
      )}
    >
      <AnimatePresence>
        {open ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex h-[min(580px,72vh)] w-[min(400px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[28px] border border-[#C8E84A]/35 bg-[#f7fbe8] shadow-[0_28px_64px_-18px_rgba(40,54,20,0.5)]"
          >
            <header className="relative overflow-hidden bg-[linear-gradient(160deg,#1c2610_0%,#283614_42%,#38471B_100%)] px-4 py-3.5">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#B8D926]/20 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-8 left-10 h-20 w-28 rounded-full bg-[#C8E84A]/15 blur-2xl"
              />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-[#B8D926] via-[#C8E84A] to-transparent"
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative shrink-0">
                    <ChatBotLogo size="md" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#B8D926] ring-2 ring-[#283614]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading text-[15px] font-semibold leading-tight tracking-tight text-white sm:text-base">
                      Bullwave Assistant
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-[#D4E88A] sm:text-xs">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B8D926] opacity-60" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#B8D926]" />
                      </span>
                      Online · AI & voice
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {ttsSupported ? (
                    <button
                      type="button"
                      aria-label={
                        voiceEnabled
                          ? "Mute assistant voice"
                          : "Unmute assistant voice"
                      }
                      title={
                        voiceEnabled
                          ? "Mute voice responses"
                          : "Enable voice responses"
                      }
                      onClick={toggleVoiceOutput}
                      className={cn(
                        "rounded-xl p-2 transition",
                        voiceEnabled
                          ? "text-[#C8E84A] hover:bg-white/10"
                          : "text-white/45 hover:bg-white/10 hover:text-[#D4E88A]",
                      )}
                    >
                      {voiceEnabled ? (
                        <Volume2 className="h-4 w-4" />
                      ) : (
                        <VolumeX className="h-4 w-4" />
                      )}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    aria-label="Close chat"
                    onClick={() => setOpen(false)}
                    className="rounded-xl p-2 text-[#D4E88A] transition hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </header>

            <div
              ref={listRef}
              className="bw-chat-scroll flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(180deg,#f7fbe8_0%,#eef6d4_48%,#f7fbe8_100%)] px-3 py-3.5"
            >
              {messages.map((message, index) => {
                const isUser = message.role === "user";
                return (
                  <div
                    key={`${message.role}-${index}-${message.content.slice(0, 16)}`}
                    className={cn(
                      "flex items-end gap-1.5",
                      isUser ? "justify-end" : "justify-start",
                    )}
                  >
                    {isUser ? null : (
                      <ChatBotLogo
                        size="sm"
                        className="mb-0.5 hidden ring-1 ring-[#C8E84A]/40 sm:inline-flex"
                      />
                    )}
                    <div
                      className={cn(
                        "max-w-[86%] px-3.5 py-2.5 text-[13px] leading-relaxed sm:text-sm",
                        isUser
                          ? "rounded-[20px] rounded-br-md bg-gradient-to-br from-[#B8D926] to-[#C8E84A] font-medium text-[#283614] shadow-[0_8px_18px_-10px_rgba(184,217,38,0.85)]"
                          : "rounded-[20px] rounded-bl-md border border-[#dce8a8] bg-white text-[#38471B] shadow-[0_10px_22px_-12px_rgba(40,54,20,0.28)]",
                      )}
                    >
                      {formatMessage(message.content)}
                    </div>
                  </div>
                );
              })}

              {activeTopic && !busy ? (
                <div className="flex flex-wrap gap-1.5 pl-0.5 sm:pl-8">
                  {followUps.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      disabled={busy}
                      onClick={() => onQuestionClick(item)}
                      className="inline-flex max-w-full items-center rounded-full border border-[#C8E84A]/50 bg-white/90 px-2.5 py-1.5 text-left text-[11px] font-semibold text-[#38471B] shadow-[0_6px_14px_rgba(40,54,20,0.06)] transition hover:border-[#B8D926] hover:bg-[#B8D926] disabled:opacity-60"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}

              {busy ? (
                <div className="flex items-end justify-start gap-1.5">
                  <ChatBotLogo
                    size="sm"
                    className="mb-0.5 hidden ring-1 ring-[#C8E84A]/40 sm:inline-flex"
                  />
                  <div className="inline-flex items-center gap-2 rounded-[20px] rounded-bl-md border border-[#dce8a8] bg-white px-3.5 py-2.5 text-sm text-[#4A5824] shadow-[0_8px_18px_rgba(40,54,20,0.06)]">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#B8D926] [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#C8E84A]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9BB820] [animation-delay:0.2s]" />
                    </span>
                    Thinking…
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-[#dce8a8] bg-white/95 px-3 pt-2.5 backdrop-blur-sm">
              <div className="flex gap-1.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  const isActive = activeTopic === action.id;
                  return (
                    <button
                      key={action.id}
                      type="button"
                      disabled={busy}
                      onClick={() => onQuickAction(action.id)}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition disabled:opacity-60 sm:text-xs",
                        isActive
                          ? "border-[#283614] bg-[#283614] text-[#C8E84A] shadow-[0_8px_16px_-10px_rgba(40,54,20,0.7)]"
                          : "border-[#dce8a8] bg-[#f7fbe8] text-[#38471B] hover:border-[#B8D926] hover:bg-[#B8D926]/25",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-3 w-3",
                          isActive ? "text-[#B8D926]" : "text-[#4A5824]",
                        )}
                      />
                      {action.label}
                    </button>
                  );
                })}
              </div>
              {voiceHint ? (
                <p
                  className={cn(
                    "pb-1.5 text-xs",
                    listening ? "font-semibold text-[#38471B]" : "text-[#5a6330]",
                  )}
                  aria-live="polite"
                >
                  {voiceHint}
                </p>
              ) : null}
              <form onSubmit={onSubmit} className="flex items-center gap-2 pb-3">
                <div className="relative flex h-12 min-w-0 flex-1 items-center">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={
                      listening || voiceMode
                        ? "Listening…"
                        : "Ask about rides, safety, or fares…"
                    }
                    maxLength={1200}
                    disabled={busy}
                    className="h-12 w-full rounded-full border border-[#dce8a8] bg-[#f7fbe8] py-2 pl-4 pr-12 text-sm text-[#38471B] outline-none placeholder:text-[#5a6330]/65 focus:border-[#B8D926] focus:bg-white focus:ring-2 focus:ring-[#B8D926]/30 disabled:opacity-60"
                  />
                  {speechSupported ? (
                    <button
                      type="button"
                      aria-label={
                        listening || voiceMode
                          ? "Stop voice chat"
                          : "Start voice chat"
                      }
                      title={
                        listening || voiceMode
                          ? "Stop voice chat"
                          : "Start voice chat"
                      }
                      disabled={busy && !voiceMode}
                      onClick={toggleListening}
                      className={cn(
                        "absolute right-1.5 inline-flex h-9 w-9 items-center justify-center rounded-full transition disabled:opacity-50",
                        listening || voiceMode
                          ? "bg-[#283614] text-[#C8E84A] shadow-[0_8px_16px_-8px_rgba(40,54,20,0.7)]"
                          : "text-[#38471B] hover:bg-[#B8D926]/30",
                      )}
                    >
                      {listening || voiceMode ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </button>
                  ) : null}
                </div>
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  aria-label="Send message"
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#B8D926] to-[#C8E84A] text-[#283614] shadow-[0_12px_22px_-10px_rgba(184,217,38,0.95)] transition hover:brightness-[1.04] disabled:opacity-45"
                >
                  {busy ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label={open ? "Close Bullwave Assistant" : "Open Bullwave Assistant"}
        onClick={() => setOpen((value) => !value)}
        whileTap={{ scale: 0.96 }}
        animate={
          open
            ? { x: 0, y: 0 }
            : {
                x: [0, -5, 0, 5, 0, 0],
                y: [0, 0, -5, 0, 5, 0],
              }
        }
        transition={
          open
            ? { duration: 0.2 }
            : {
                duration: 2.6,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
        className={cn(
          "pointer-events-auto relative flex h-[3.65rem] w-[3.65rem] items-center justify-center overflow-visible rounded-full text-white transition-shadow duration-300",
          open
            ? "border-2 border-[#C8E84A] bg-[#283614] shadow-[0_16px_32px_-10px_rgba(40,54,20,0.55)]"
            : "border-2 border-[#C8E84A]/70 bg-[linear-gradient(160deg,#1c2610_0%,#38471B_100%)] shadow-[0_16px_34px_-8px_rgba(40,54,20,0.6)]",
        )}
      >
        {!open ? (
          <>
            <span aria-hidden className="bw-chat-fab-ring" />
            <span aria-hidden className="bw-chat-fab-ring bw-chat-fab-ring--delay" />
          </>
        ) : null}
        <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full">
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -40, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 40, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="h-6 w-6 text-[#C8E84A]" />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="relative flex h-full w-full items-center justify-center"
              >
                <ChatBotLogo size="lg" className="ring-[#C8E84A]/70" priority />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        {!open ? (
          <span className="absolute -right-0.5 -top-0.5 z-10 h-3 w-3 rounded-full bg-[#B8D926] ring-2 ring-white" />
        ) : null}
      </motion.button>
    </div>
  );
}
