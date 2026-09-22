"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  HelpCircle,
  Loader2,
  Mic,
  MicOff,
  Package,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { BW_RIDES_LOGO_SRC } from "@/components/layout/WaveGoLogo";
import {
  fetchAiChatBootstrap,
  sendAiChatMessage,
  type AiChatMessage,
  type AiChatTopic,
  type AiChatTopicQuestion,
} from "@/lib/ai-chat-api";
import {
  chatFabDockClass,
  isChatHiddenPath,
} from "@/lib/chat-widget";
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
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f4f8e4] ring-2 ring-[#C6E31A]/55",
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

function pickIndianFemaleVoice(
  voices: SpeechSynthesisVoice[],
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

    if (
      /heera|neerja|priya|raveena|aditi|veena|swara|ananya|isha|kavya|meera|indian.*female|female.*indian/.test(
        name,
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

function topicIcon(label: string) {
  const key = label.toLowerCase();
  if (/safe|sos|women|security/.test(key)) return ShieldCheck;
  if (/parcel|delivery|package/.test(key)) return Package;
  if (/rent|help|support|general/.test(key)) return HelpCircle;
  return Sparkles;
}

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
  const lines = cleaned.split("\n");
  return lines.map((line, index) => (
    <span key={`${index}-${line.slice(0, 12)}`}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ));
}

const LOADING_WELCOME: AiChatMessage = {
  role: "assistant",
  content: "Connecting to Bullwave Assistant…",
};

export function FloatingChatWidget() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([LOADING_WELCOME]);
  const [topics, setTopics] = useState<AiChatTopic[]>([]);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [listening, setListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [voiceHint, setVoiceHint] = useState<string | null>(null);
  const [showAssistHint, setShowAssistHint] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const voiceModeRef = useRef(false);
  const pendingTranscriptRef = useRef("");
  const sentFromVoiceRef = useRef(false);
  const messagesRef = useRef(messages);
  const busyRef = useRef(busy);
  const voiceEnabledRef = useRef(voiceEnabled);
  const askRef = useRef<(text: string, displayAs?: string) => Promise<void>>(
    async () => undefined,
  );

  messagesRef.current = messages;
  busyRef.current = busy;
  voiceEnabledRef.current = voiceEnabled;

  const loadBootstrap = useCallback(async () => {
    setBootstrapping(true);
    setBootstrapError(null);
    try {
      const data = await fetchAiChatBootstrap();
      setTopics(data.topics);
      setMessages([
        {
          role: "assistant",
          content: cleanReplyText(data.welcome),
        },
      ]);
      setActiveTopicId(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not load Bullwave Assistant";
      setBootstrapError(message);
      setMessages([
        {
          role: "assistant",
          content:
            "Bullwave Assistant is temporarily unavailable. Please try again in a moment.",
        },
      ]);
    } finally {
      setBootstrapping(false);
    }
  }, []);

  const hidden = isChatHiddenPath(pathname);

  useEffect(() => {
    if (hidden) setOpen(false);
  }, [hidden]);

  useEffect(() => {
    if (!open || hidden) return;
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, hidden]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowAssistHint(false), 9000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    void loadBootstrap();
  }, [loadBootstrap]);

  useEffect(() => {
    const Recognition = getSpeechRecognitionCtor();
    setSpeechSupported(Boolean(Recognition));
    setTtsSupported(
      typeof window !== "undefined" && "speechSynthesis" in window,
    );

    const loadVoices = () => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }
      voiceRef.current = pickIndianFemaleVoice(
        window.speechSynthesis.getVoices(),
      );
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
    } else {
      setShowAssistHint(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 180);
    return () => window.clearTimeout(timer);
  }, [open, messages, busy, activeTopicId, listening]);

  function speakAssistant(text: string): Promise<void> {
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
      window.setTimeout(() => {
        window.speechSynthesis.speak(utterance);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }, 40);
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
        pendingTranscriptRef.current ||
        interimChunk ||
        finalChunk
      ).trim();
      if (display) setInput(display);

      if (finalChunk.trim()) {
        submitVoiceTranscript(pendingTranscriptRef.current || finalChunk);
      }
    };

    recognition.onerror = (event) => {
      setListening(false);
      if (event.error === "not-allowed") {
        voiceModeRef.current = false;
        setVoiceMode(false);
        setVoiceHint(
          "Microphone access is blocked. Please allow permission to continue.",
        );
      } else if (event.error === "no-speech") {
        setVoiceHint("No speech detected. Please try again.");
      } else if (event.error !== "aborted") {
        setVoiceHint("We couldn’t hear that. Tap the mic and try again.");
      }
    };

    recognition.onend = () => {
      setListening(false);

      if (
        voiceModeRef.current &&
        !busyRef.current &&
        !sentFromVoiceRef.current &&
        pendingTranscriptRef.current.trim()
      ) {
        submitVoiceTranscript(pendingTranscriptRef.current);
        return;
      }

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
    } catch (err) {
      content =
        err instanceof Error
          ? err.message
          : "Could not reach Bullwave Assistant. Please try again.";
    }

    setMessages((prev) => [...prev, { role: "assistant", content }]);
    setBusy(false);

    if (voiceModeRef.current && voiceEnabledRef.current) {
      setVoiceHint("Playing response…");
      await speakAssistant(content);
    }

    sentFromVoiceRef.current = false;
    pendingTranscriptRef.current = "";

    if (voiceModeRef.current) {
      setVoiceHint("Listening… your message will send automatically");
      startListening();
    } else {
      setVoiceHint(null);
    }
  }

  askRef.current = ask;

  function onTopicClick(topic: AiChatTopic) {
    if (busy || bootstrapping) return;
    setActiveTopicId(topic.id);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: topic.label },
      {
        role: "assistant",
        content: `Here are common ${topic.label} questions from our support team. Pick one, or type your own.`,
      },
    ]);
  }

  function onFaqClick(item: AiChatTopicQuestion) {
    if (busy || bootstrapping) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: item.label },
      { role: "assistant", content: cleanReplyText(item.answer) },
    ]);
    if (voiceModeRef.current) {
      void speakAssistant(item.answer).then(() => {
        if (voiceModeRef.current) startListening();
      });
    }
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

  const activeTopic = topics.find((t) => t.id === activeTopicId) ?? null;
  const followUps = activeTopic?.questions ?? [];

  return (
    <div className={cn(hidden && "hidden")} aria-hidden={hidden || undefined}>
      <AnimatePresence>
        {open ? (
          <motion.button
            key="chat-backdrop"
            type="button"
            aria-label="Close chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="pointer-events-auto fixed inset-0 z-[119] bg-[#111411]/40 backdrop-blur-[1px] lg:bg-black/20"
          />
        ) : null}
      </AnimatePresence>

      <div
        className={cn(
          "pointer-events-none fixed z-[120] flex flex-col",
          open
            ? "inset-x-0 bottom-0 max-w-none items-stretch gap-0 lg:inset-x-auto lg:bottom-8 lg:right-6 lg:max-w-[calc(100vw-1rem)] lg:items-end lg:gap-3"
            : cn(
                "items-end gap-2 max-w-[min(100vw-1.25rem,22rem)]",
                chatFabDockClass(pathname),
              ),
        )}
      >
        <AnimatePresence>
          {open ? (
            <motion.div
              key="panel"
              role="dialog"
              aria-label="Bullwave Assistant"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "pointer-events-auto flex min-h-0 w-full flex-col overflow-hidden",
                "h-[min(88dvh,calc(100dvh-4.25rem))] rounded-t-[1.5rem] border border-b-0 border-[#C6E31A]/35 bg-[#f7f9f0]",
                "shadow-[0_28px_64px_-18px_rgba(17,20,17,0.5)]",
                "sm:h-[min(86dvh,620px)]",
                "lg:mb-0 lg:mr-0 lg:h-[min(580px,72dvh)] lg:w-[min(400px,calc(100vw-2.5rem))] lg:rounded-[1.75rem] lg:border-b",
                "lg:relative",
              )}
            >
              <header className="relative overflow-hidden bg-[linear-gradient(160deg,#111411_0%,#1B3A22_48%,#2a4a28_100%)] px-4 py-3.5">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#C6E31A]/20 blur-3xl"
                />
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-[#C6E31A] via-[#D4F04A] to-transparent"
                />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative shrink-0">
                      <ChatBotLogo size="md" />
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#C6E31A] ring-2 ring-[#1B3A22]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading text-[15px] font-semibold leading-tight tracking-tight text-white sm:text-base">
                        Bullwave Assistant
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-[#D4E88A] sm:text-xs">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C6E31A] opacity-60" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#C6E31A]" />
                        </span>
                        {bootstrapping
                          ? "Loading from server…"
                          : bootstrapError
                            ? "Reconnect needed"
                            : "Online · live AI & FAQs"}
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
                        onClick={toggleVoiceOutput}
                        className={cn(
                          "rounded-xl p-2 transition",
                          voiceEnabled
                            ? "text-[#C6E31A] hover:bg-white/10"
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
                className="bw-chat-scroll min-h-0 flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(180deg,#f7f9f0_0%,#eef2e0_48%,#f7f9f0_100%)] px-3 py-3.5"
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
                          className="mb-0.5 hidden ring-1 ring-[#C6E31A]/40 sm:inline-flex"
                        />
                      )}
                      <div
                        className={cn(
                          "max-w-[86%] px-3.5 py-2.5 text-[13px] leading-relaxed sm:text-sm",
                          isUser
                            ? "rounded-[20px] rounded-br-md bg-[#C6E31A] font-medium text-[#111411] shadow-[0_8px_18px_-10px_rgba(198,227,26,0.85)]"
                            : "rounded-[20px] rounded-bl-md border border-[#dce8a8] bg-white text-[#111411] shadow-[0_10px_22px_-12px_rgba(17,20,17,0.28)]",
                        )}
                      >
                        {formatMessage(message.content)}
                      </div>
                    </div>
                  );
                })}

                {bootstrapError && !bootstrapping ? (
                  <div className="flex justify-start pl-0.5 sm:pl-8">
                    <button
                      type="button"
                      onClick={() => void loadBootstrap()}
                      className="rounded-full border border-[#C6E31A]/55 bg-white px-3 py-1.5 text-[11px] font-semibold text-[#1B3A22] hover:bg-[#C6E31A]/20"
                    >
                      Retry connection
                    </button>
                  </div>
                ) : null}

                {activeTopic && !busy && !bootstrapping ? (
                  <div className="flex flex-wrap gap-1.5 pl-0.5 sm:pl-8">
                    {followUps.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        disabled={busy}
                        onClick={() => onFaqClick(item)}
                        className="inline-flex max-w-full items-center rounded-full border border-[#C6E31A]/45 bg-white/90 px-2.5 py-1.5 text-left text-[11px] font-semibold text-[#111411] shadow-[0_6px_14px_rgba(17,20,17,0.06)] transition hover:border-[#C6E31A] hover:bg-[#C6E31A] disabled:opacity-60"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : null}

                {busy || bootstrapping ? (
                  <div className="flex items-end justify-start gap-1.5">
                    <ChatBotLogo
                      size="sm"
                      className="mb-0.5 hidden ring-1 ring-[#C6E31A]/40 sm:inline-flex"
                    />
                    <div className="inline-flex items-center gap-2 rounded-[20px] rounded-bl-md border border-[#dce8a8] bg-white px-3.5 py-2.5 text-sm text-[#5a6330] shadow-[0_8px_18px_rgba(17,20,17,0.06)]">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#C6E31A] [animation-delay:-0.2s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#D4F04A]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9BB820] [animation-delay:0.2s]" />
                      </span>
                      {bootstrapping ? "Loading…" : "Thinking…"}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-[#e8eed8] bg-white/95 px-3 pt-2.5 backdrop-blur-sm pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:pb-3">
                {topics.length > 0 ? (
                  <div className="flex gap-1.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {topics.map((topic) => {
                      const Icon = topicIcon(topic.label);
                      const isActive = activeTopicId === topic.id;
                      return (
                        <button
                          key={topic.id}
                          type="button"
                          disabled={busy || bootstrapping}
                          onClick={() => onTopicClick(topic)}
                          className={cn(
                            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition disabled:opacity-60 sm:text-xs",
                            isActive
                              ? "border-[#111411] bg-[#111411] text-[#C6E31A]"
                              : "border-[#e0e6d0] bg-[#f7f9f0] text-[#111411] hover:border-[#C6E31A] hover:bg-[#C6E31A]/25",
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-3 w-3",
                              isActive ? "text-[#C6E31A]" : "text-[#5a7a12]",
                            )}
                          />
                          {topic.label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
                {voiceHint ? (
                  <p
                    className={cn(
                      "pb-1.5 text-xs",
                      listening
                        ? "font-semibold text-[#111411]"
                        : "text-[#5a6330]",
                    )}
                    aria-live="polite"
                  >
                    {voiceHint}
                  </p>
                ) : null}
                <form onSubmit={onSubmit} className="flex items-center gap-2 pb-1 lg:pb-0">
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
                      disabled={busy || bootstrapping}
                      className="h-12 w-full rounded-full border border-[#e0e6d0] bg-[#f7f9f0] py-2 pl-4 pr-12 text-sm text-[#111411] outline-none placeholder:text-[#5a6330]/65 focus:border-[#C6E31A] focus:bg-white focus:ring-2 focus:ring-[#C6E31A]/30 disabled:opacity-60"
                    />
                    {speechSupported ? (
                      <button
                        type="button"
                        aria-label={
                          listening || voiceMode
                            ? "Stop voice chat"
                            : "Start voice chat"
                        }
                        disabled={(busy || bootstrapping) && !voiceMode}
                        onClick={toggleListening}
                        className={cn(
                          "absolute right-1.5 inline-flex h-9 w-9 items-center justify-center rounded-full transition disabled:opacity-50",
                          listening || voiceMode
                            ? "bg-[#111411] text-[#C6E31A]"
                            : "text-[#111411] hover:bg-[#C6E31A]/30",
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
                    disabled={busy || bootstrapping || !input.trim()}
                    aria-label="Send message"
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#C6E31A] text-[#111411] shadow-[0_12px_22px_-10px_rgba(198,227,26,0.95)] transition hover:bg-[#D4F04A] disabled:opacity-45"
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

        {!open ? (
          <motion.button
            type="button"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setOpen(true)}
            className="pointer-events-auto max-w-[min(13rem,calc(100vw-5.5rem))] rounded-2xl rounded-br-md border border-[#C6E31A]/45 bg-white px-3 py-2 text-left text-[12px] font-semibold leading-snug text-[#111411] shadow-[0_12px_28px_-14px_rgba(17,20,17,0.45)] lg:hidden"
          >
            How can I help you?
          </motion.button>
        ) : null}

        {!open && showAssistHint ? (
          <motion.button
            type="button"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            onClick={() => setOpen(true)}
            className="pointer-events-auto hidden max-w-[13rem] rounded-2xl rounded-br-md border border-[#C6E31A]/45 bg-white px-3 py-2 text-left text-[13px] font-semibold leading-snug text-[#111411] shadow-[0_12px_28px_-14px_rgba(17,20,17,0.45)] lg:block"
          >
            How can I help you?
          </motion.button>
        ) : null}

        <motion.button
          type="button"
          aria-label={
            open ? "Close Bullwave Assistant" : "Open Bullwave Assistant"
          }
          onClick={() => setOpen((value) => !value)}
          whileTap={{ scale: 0.96 }}
          animate={
            open
              ? { x: 0, y: 0 }
              : {
                  x: [0, -4, 0, 4, 0, 0],
                  y: [0, 0, -4, 0, 4, 0],
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
            "pointer-events-auto relative flex h-14 w-14 shrink-0 items-center justify-center overflow-visible rounded-full text-white transition-shadow duration-300",
            "max-lg:h-12 max-lg:w-12",
            open && "hidden lg:flex",
            open
              ? "border-2 border-[#C6E31A] bg-[#111411] shadow-[0_16px_32px_-10px_rgba(17,20,17,0.55)]"
              : "border-2 border-[#C6E31A]/70 bg-[linear-gradient(160deg,#111411_0%,#1B3A22_100%)] shadow-[0_16px_34px_-8px_rgba(17,20,17,0.6)]",
          )}
        >
          {!open ? (
            <>
              <span aria-hidden className="bw-chat-fab-ring" />
              <span
                aria-hidden
                className="bw-chat-fab-ring bw-chat-fab-ring--delay"
              />
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
                  <X className="h-6 w-6 text-[#C6E31A]" />
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
                  <ChatBotLogo size="lg" className="ring-[#C6E31A]/70" priority />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          {!open ? (
            <span className="absolute -right-0.5 -top-0.5 z-10 h-3 w-3 rounded-full bg-[#C6E31A] ring-2 ring-white" />
          ) : null}
        </motion.button>
      </div>
    </div>
  );
}
