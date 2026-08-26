"use client";

import { useCallback, useEffect, useState } from "react";
import {
  APP_LANGUAGES,
  type AppLanguage,
  type AppLanguageCode,
  readAppLanguage,
  writeAppLanguage,
} from "@/lib/app-language";
import {
  type MessageKey,
  translate,
} from "@/lib/i18n/account-settings";

export function useAppLanguage() {
  const [language, setLanguage] = useState<AppLanguage>(APP_LANGUAGES[0]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setLanguage(readAppLanguage());
    sync();
    setReady(true);
    window.addEventListener("bw-language-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("bw-language-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setAppLanguage = useCallback((code: AppLanguageCode) => {
    const next = writeAppLanguage(code);
    setLanguage(next);
    return next;
  }, []);

  const t = useCallback(
    (key: MessageKey) => translate(language.code, key),
    [language.code],
  );

  return { language, setAppLanguage, t, code: language.code, ready };
}
