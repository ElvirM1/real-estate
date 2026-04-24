"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  KeyboardEvent,
  ClipboardEvent,
  FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { FiCheck, FiX } from "react-icons/fi";
import { HiOutlineLockClosed, HiOutlineMail } from "react-icons/hi";

const CORRECT_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN ?? "";
const MAX_ATTEMPTS = 3;
const COOLDOWN_SECONDS = 10;
const PIN_LENGTH = 6;

type Step = "pin" | "login";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AdminAccessModal({ open, onClose }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const { login } = useAuth();

  const [step, setStep] = useState<Step>("pin");

  // — PIN state —
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [shake, setShake] = useState(false);
  const [pinError, setPinError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [pinSuccess, setPinSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // — Login state —
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Reset + focus when modal opens
  useEffect(() => {
    if (!open) return;
    setStep("pin");
    setDigits(Array(PIN_LENGTH).fill(""));
    setPinError("");
    setAttempts(0);
    setCooldown(0);
    setPinSuccess(false);
    setEmail("");
    setPassword("");
    setLoginError("");
    const timer = setTimeout(() => inputRefs.current[0]?.focus(), 420);
    return () => clearTimeout(timer);
  }, [open]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => {
      setCooldown((c) => {
        const next = c - 1;
        if (next === 0) setTimeout(() => inputRefs.current[0]?.focus(), 80);
        return next;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ─── PIN logic ───────────────────────────────────────────

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }, []);

  const handleWrong = useCallback(() => {
    setDigits(Array(PIN_LENGTH).fill(""));
    triggerShake();
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
    setAttempts((prev) => {
      const next = prev + 1;
      if (next >= MAX_ATTEMPTS) {
        setPinError(`Provo përsëri pas ${COOLDOWN_SECONDS} sekondave`);
        setCooldown(COOLDOWN_SECONDS);
        return 0;
      }
      setPinError("Kodi është i pasaktë");
      return next;
    });
  }, [triggerShake]);

  const handlePinSuccess = useCallback(() => {
    setPinSuccess(true);
    setPinError("");
    sessionStorage.setItem("pinVerified", "1");
    setTimeout(() => {
      setStep("login");
      setPinSuccess(false);
    }, 800);
  }, []);

  const checkPin = useCallback(
    (pin: string) => {
      if (pin === CORRECT_PIN) {
        handlePinSuccess();
      } else {
        handleWrong();
      }
    },
    [handlePinSuccess, handleWrong],
  );

  const handleDigitChange = (index: number, value: string) => {
    if (cooldown > 0 || pinSuccess) return;
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setPinError("");
    if (digit) {
      if (index < PIN_LENGTH - 1) inputRefs.current[index + 1]?.focus();
      if (next.every((d) => d !== ""))
        setTimeout(() => checkPin(next.join("")), 50);
    }
  };

  const handleDigitKeyDown = (
    index: number,
    e: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (cooldown > 0 || pinSuccess) return;
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (cooldown > 0 || pinSuccess) return;
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, PIN_LENGTH);
    if (!pasted) return;
    const next = Array(PIN_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setDigits(next);
    setPinError("");
    inputRefs.current[Math.min(pasted.length, PIN_LENGTH - 1)]?.focus();
    if (pasted.length === PIN_LENGTH) setTimeout(() => checkPin(pasted), 50);
  };

  // ─── Login logic ─────────────────────────────────────────

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      await login(email, password);
      onClose();
      router.push("/admin");
    } catch {
      setLoginError(t("admin.loginError"));
    } finally {
      setLoginLoading(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        style={{ animation: "amodal-in 0.18s ease both" }}
      />

      {/* Card wrapper — shake applied here */}
      <div
        className="relative z-10 w-full max-w-sm"
        style={
          shake
            ? {
                animation:
                  "apin-shake 0.55s cubic-bezier(.36,.07,.19,.97) both",
              }
            : undefined
        }
      >
        {/* Glass card */}
        <div
          className="relative bg-slate-900/85 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl overflow-hidden"
          style={{ animation: "acard-in 0.38s cubic-bezier(.22,1,.36,1) both" }}
        >
          {/* Close × */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-all"
            aria-label="Close"
          >
            <FiX className="w-4 h-4" />
          </button>

          {/* ── STEP: PIN ───────────────────────────────── */}
          {step === "pin" && (
            <div className="p-10 flex flex-col items-center">
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg transition-all duration-500 ${
                  pinSuccess ? "bg-green-500 scale-110" : "bg-blue-600"
                }`}
              >
                {pinSuccess ? (
                  <FiCheck className="w-7 h-7 text-white" />
                ) : (
                  <HiOutlineLockClosed className="w-7 h-7 text-white" />
                )}
              </div>

              <h2 className="text-[17px] font-bold text-white mb-1 tracking-tight">
                Admin Access
              </h2>
              <p className="text-white/45 text-sm mb-8">
                {pinSuccess ? "Mirë se erdhët!" : "Fut kodin PIN"}
              </p>

              {/* PIN digit boxes */}
              <div className="flex gap-3 mb-6">
                {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[i]}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(i, e)}
                    onPaste={handlePaste}
                    disabled={cooldown > 0 || pinSuccess}
                    aria-label={`PIN digit ${i + 1}`}
                    className={[
                      "w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200 bg-white/5 text-white caret-transparent select-none",
                      pinSuccess
                        ? "border-green-400 bg-green-500/20"
                        : digits[i]
                          ? "border-blue-400 bg-white/12 scale-[1.06]"
                          : "border-white/20 focus:border-blue-400 focus:bg-white/12",
                      cooldown > 0 ? "opacity-40 cursor-not-allowed" : "",
                    ].join(" ")}
                    style={{
                      animation:
                        "apin-appear 0.38s cubic-bezier(.22,1,.36,1) both",
                      animationDelay: `${i * 55}ms`,
                    }}
                  />
                ))}
              </div>

              {/* Status row — fixed height prevents jump */}
              <div className="h-5 flex items-center justify-center">
                {pinError && !pinSuccess && (
                  <p className="text-red-400 text-sm">{pinError}</p>
                )}
                {cooldown > 0 && (
                  <p className="text-white/40 text-xs tabular-nums">
                    {cooldown}s
                  </p>
                )}
              </div>

              {/* Attempt dots */}
              {attempts > 0 && !pinSuccess && cooldown === 0 && (
                <div className="flex gap-1.5 mt-4">
                  {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                        i < attempts ? "bg-red-400" : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STEP: LOGIN ──────────────────────────────── */}
          {step === "login" && (
            <div
              className="p-8 flex flex-col"
              style={{
                animation: "acard-in 0.32s cubic-bezier(.22,1,.36,1) both",
              }}
            >
              <div className="flex flex-col items-center mb-7">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <HiOutlineMail className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-[17px] font-bold text-white">
                  {t("admin.login")}
                </h2>
                <p className="text-white/45 text-sm mt-1">
                  {t("admin.loginSubtitle")}
                </p>
              </div>

              <form
                onSubmit={handleLoginSubmit}
                className="space-y-4"
                noValidate
              >
                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-white/55 mb-1.5">
                    {t("admin.email")}
                  </label>
                  <div className="relative">
                    <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-white/55 mb-1.5">
                    {t("admin.password")}
                  </label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Error */}
                {loginError && (
                  <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-sm px-4 py-2.5 rounded-xl">
                    {loginError}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed text-sm mt-1"
                >
                  {loginLoading ? t("admin.signingIn") : t("admin.signIn")}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Scoped keyframes */}
      <style>{`
        @keyframes amodal-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes acard-in {
          from { opacity: 0; transform: scale(0.93) translateY(14px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes apin-appear {
          from { opacity: 0; transform: translateY(8px) scale(0.85); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes apin-shake {
          0%,100% { transform: translateX(0); }
          15%     { transform: translateX(-10px); }
          30%     { transform: translateX(10px); }
          45%     { transform: translateX(-7px); }
          60%     { transform: translateX(7px); }
          75%     { transform: translateX(-4px); }
          90%     { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
