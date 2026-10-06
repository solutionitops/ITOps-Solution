import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
const RECAPTCHA_V2_SITE_KEY = import.meta.env.VITE_RECAPTCHA_V2_SITE_KEY || import.meta.env.VITE_RECAPTCHA_SITE_KEY;
// FINDING-05: Use a separate v3 site key var; fall back to the v2 key for
// projects that share one key. The v3 script ID was previously an undefined
// reference — it now uses the correctly-declared constant.
const RECAPTCHA_V3_SITE_KEY = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY || RECAPTCHA_V2_SITE_KEY;
const RECAPTCHA_TYPE = import.meta.env.VITE_RECAPTCHA_TYPE || "v2";
const HCAPTCHA_SCRIPT_ID = "hcaptcha-script";
const RECAPTCHA_V2_SCRIPT_ID = "recaptcha-v2-script";
const RECAPTCHA_V3_SCRIPT_ID = "recaptcha-v3-script";
const MIN_HUMAN_MS = 1200;

/**
 * Renders as an invisible pair of fields — a honeypot text input real users
 * never see or fill, and a mount timestamp — that `useCaptchaGuard` reads to
 * reject obvious bots (empty-honeypot + too-fast-to-be-human is a real,
 * functioning signal on its own, no third-party service required).
 */
export function HoneypotField({ inputRef }) {
  return (
    <input
      ref={inputRef}
      type="text"
      name="company_website"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="pointer-events-none absolute left-[-9999px] top-auto h-px w-px overflow-hidden opacity-0"
    />
  );
}

/**
 * Reads the honeypot + elapsed-time signals and returns whether the
 * submission looks human. Not a substitute for server-verified CAPTCHA —
 * it's a same-day, zero-setup deterrent against naive/scripted bots.
 */
export function useCaptchaGuard() {
  const honeypotRef = useRef(null);
  const mountedAtRef = useRef(Date.now());
  function isLikelyBot() {
    const honeypotFilled = !!honeypotRef.current?.value;
    const tooFast = Date.now() - mountedAtRef.current < MIN_HUMAN_MS;
    return honeypotFilled || tooFast;
  }
  return { honeypotRef, isLikelyBot };
}

/**
 * The visible security check. Supports Google reCAPTCHA v2 Checkbox ("I'm not a robot"),
 * reCAPTCHA v3, hCaptcha, or falls back to a self-contained "Verify you're human" challenge.
 */
export function CaptchaChallenge({ onChange, action = "submit" }) {
  if (RECAPTCHA_V2_SITE_KEY && RECAPTCHA_TYPE === "v2") {
    return <ReCaptchaV2Widget siteKey={RECAPTCHA_V2_SITE_KEY} onChange={onChange} />;
  }
  if (RECAPTCHA_V3_SITE_KEY && RECAPTCHA_TYPE === "v3") {
    return <ReCaptchaV3Widget onChange={onChange} action={action} />;
  }
  if (HCAPTCHA_SITE_KEY) {
    return <HCaptchaWidget onChange={onChange} />;
  }
  return <SelfCheckChallenge onChange={onChange} />;
}

function ReCaptchaV2Widget({ siteKey, onChange }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.grecaptcha?.render);

  useEffect(() => {
    if (window.grecaptcha?.render) {
      setReady(true);
      return;
    }
    // FINDING-05: Use the correctly-declared constant for the v2 script ID.
    if (document.getElementById(RECAPTCHA_V2_SCRIPT_ID)) return;
    const script = document.createElement("script");
    script.id = RECAPTCHA_V2_SCRIPT_ID;
    script.src = "https://www.google.com/recaptcha/api.js?onload=onGrecaptchaV2Load&render=explicit";
    script.async = true;
    script.defer = true;
    window.onGrecaptchaV2Load = () => setReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current || widgetIdRef.current !== null || !window.grecaptcha?.render) return;
    try {
      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token) => onChange(token),
        "expired-callback": () => onChange(null),
        "error-callback": () => onChange(null),
      });
    } catch (err) {
      console.warn("reCAPTCHA v2 render error:", err);
    }
  }, [ready, siteKey, onChange]);

  return <div ref={containerRef} className="my-2 flex justify-center" />;
}

function ReCaptchaV3Widget({ onChange, action = "submit" }) {
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.grecaptcha);

  useEffect(() => {
    if (window.grecaptcha) {
      setReady(true);
      return;
    }
    // FINDING-05: Use the correctly-declared RECAPTCHA_V3_SCRIPT_ID constant
    // (previously was referencing an undefined variable `RECAPTCHA_SCRIPT_ID`).
    if (document.getElementById(RECAPTCHA_V3_SCRIPT_ID)) return;
    const script = document.createElement("script");
    script.id = RECAPTCHA_V3_SCRIPT_ID;
    // FINDING-05: Use the correctly-declared RECAPTCHA_V3_SITE_KEY variable
    // (previously was referencing an undefined variable `RECAPTCHA_SITE_KEY`).
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_V3_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => setReady(true));
      }
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!ready || !window.grecaptcha) return;
    let isSubscribed = true;
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(RECAPTCHA_V3_SITE_KEY, { action })
        .then((token) => {
          if (isSubscribed) onChange(token);
        })
        .catch((err) => {
          // FINDING-06: On failure, pass null instead of a fake bypass token.
          // The form will block submission and show "Please complete the security check."
          console.warn("reCAPTCHA v3 execution failed:", err);
          if (isSubscribed) onChange(null);
        });
    });
    return () => {
      isSubscribed = false;
    };
  }, [ready, onChange, action]);

  return (
    <div className="py-1 text-center">
      <p className="text-[11px] text-white/40">
        Protected by Google reCAPTCHA v3 (
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-white/60"
        >
          Privacy
        </a>{" "}
        &{" "}
        <a
          href="https://policies.google.com/terms"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-white/60"
        >
          Terms
        </a>
        )
      </p>
    </div>
  );
}

function HCaptchaWidget({ onChange }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.hcaptcha);

  useEffect(() => {
    if (window.hcaptcha) {
      setReady(true);
      return;
    }
    if (document.getElementById(HCAPTCHA_SCRIPT_ID)) return;
    const script = document.createElement("script");
    script.id = HCAPTCHA_SCRIPT_ID;
    script.src = "https://js.hcaptcha.com/1/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current || widgetIdRef.current !== null) return;
    widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
      sitekey: HCAPTCHA_SITE_KEY,
      theme: "dark",
      callback: (token) => onChange(token),
      "expired-callback": () => onChange(null),
      "error-callback": () => onChange(null),
    });
  }, [ready, onChange]);

  return <div ref={containerRef} className="flex justify-center" />;
}

// FINDING-19: SelfCheckChallenge is intentionally a development-only fallback.
// It provides NO meaningful bot protection and MUST NOT be used in production
// without a real captcha key configured.
function SelfCheckChallenge({ onChange }) {
  const [state, setState] = useState("idle"); // idle | checking | verified

  // Warn developers in production that no captcha key is set.
  useEffect(() => {
    if (import.meta.env.PROD) {
      console.error(
        "[CaptchaChallenge] WARNING: No CAPTCHA key is configured. " +
        "The self-check fallback provides no real bot protection. " +
        "Set VITE_HCAPTCHA_SITE_KEY, VITE_RECAPTCHA_V2_SITE_KEY, or VITE_RECAPTCHA_V3_SITE_KEY."
      );
    }
  }, []);

  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  function handleClick() {
    if (state !== "idle") return;
    setState("checking");
    timeoutRef.current = setTimeout(() => {
      setState("verified");
      onChange("self-check-verified");
    }, 550);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={state === "verified"}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
        state === "verified" ? "border-emerald-400/40 bg-emerald-400/[0.06]" : "border-white/15 bg-black/30 hover:border-white/25"
      }`}
    >
      <span className="relative grid h-5 w-5 shrink-0 place-items-center rounded border border-white/25">
        {state === "checking" && (
          <motion.span
            className="h-2.5 w-2.5 rounded-full border-2 border-white/30 border-t-cyan-300"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
          />
        )}
        {state === "verified" && (
          <motion.svg
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="h-3.5 w-3.5 text-emerald-400"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
      </span>
      <span className="text-sm text-white/80">
        {state === "verified" ? "Verified — you're human" : state === "checking" ? "Verifying…" : "Verify you're human"}
      </span>
    </button>
  );
}
