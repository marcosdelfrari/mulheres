"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useAgeGate } from "@/lib/age-gate-context";
import { AGE_MINIMUM, AGE_SCAN_MS } from "@/lib/age-gate";

type GatePhase = "intro" | "active" | "passed" | "denied" | "error";

const MODEL_URL = "/models/face-api";
const EXIT_URL = "https://www.google.com";
/** Espera o stream estabilizar antes de contar o tempo de scan (evita falha na 1ª tentativa). */
const WARMUP_MS = 450;
const SCAN_FRAME_MS = 150;
const MIN_SAMPLES = 2;
const MAX_SCAN_MS = AGE_SCAN_MS + 4000;

export function AgeVerificationGate() {
  const { open, closeVerification, completeVerification } = useAgeGate();

  const webcamRef = useRef<Webcam>(null);
  const agesRef = useRef<number[]>([]);
  const scanAbortRef = useRef(false);
  const faceapiRef = useRef<typeof import("@vladmandic/face-api") | null>(null);
  const modelsPromiseRef = useRef<Promise<void> | null>(null);

  const [phase, setPhase] = useState<GatePhase>("intro");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);

  const resetSession = useCallback(() => {
    scanAbortRef.current = true;
    agesRef.current = [];
    setProgress(0);
    setMessage("");
    setCameraReady(false);
    setModelsReady(false);
  }, []);

  useEffect(() => {
    if (!open) {
      resetSession();
      setPhase("intro");
      return;
    }
    setPhase("intro");
    resetSession();
  }, [open, resetSession]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const ensureModels = useCallback(async () => {
    if (faceapiRef.current) {
      setModelsReady(true);
      return;
    }
    if (!modelsPromiseRef.current) {
      modelsPromiseRef.current = (async () => {
        const faceapi = await import("@vladmandic/face-api");
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        ]);
        faceapiRef.current = faceapi;
      })();
    }
    try {
      await modelsPromiseRef.current;
      setModelsReady(true);
    } catch {
      setMessage(
        "Não foi possível carregar a verificação. Atualize a página e tente de novo.",
      );
      setPhase("error");
    }
  }, []);

  const finishPassed = useCallback(() => {
    setPhase("passed");
    window.setTimeout(() => {
      completeVerification();
    }, 500);
  }, [completeVerification]);

  const runScan = useCallback(async () => {
    const faceapi = faceapiRef.current;
    if (!faceapi) return;

    scanAbortRef.current = false;
    agesRef.current = [];
    setProgress(0);

    await new Promise((r) => window.setTimeout(r, WARMUP_MS));
    if (scanAbortRef.current) return;

    const waitForVideo = async () => {
      for (let i = 0; i < 40; i++) {
        const video = webcamRef.current?.video;
        if (video && video.readyState >= 2 && video.videoWidth > 0) return video;
        await new Promise((r) => window.setTimeout(r, 80));
        if (scanAbortRef.current) return null;
      }
      return webcamRef.current?.video ?? null;
    };

    const video = await waitForVideo();
    if (!video || scanAbortRef.current) {
      setMessage(
        "A câmera ainda não está pronta. Aguarde um instante e toque em tentar novamente.",
      );
      setPhase("error");
      return;
    }

    const startedAt = performance.now();
    const detector = new faceapi.TinyFaceDetectorOptions({
      inputSize: 224,
      scoreThreshold: 0.35,
    });

    while (!scanAbortRef.current) {
      const elapsed = performance.now() - startedAt;
      const targetMs = AGE_SCAN_MS;
      setProgress(
        Math.min(100, Math.round((elapsed / targetMs) * 100)),
      );

      try {
        const detection = await faceapi
          .detectSingleFace(video, detector)
          .withAgeAndGender();
        if (detection?.age != null) {
          agesRef.current.push(detection.age);
        }
      } catch {
        // frame ignorado
      }

      const samples = agesRef.current;
      const enoughTime = elapsed >= AGE_SCAN_MS;
      const timedOut = elapsed >= MAX_SCAN_MS;

      if (
        (enoughTime && samples.length >= MIN_SAMPLES) ||
        (timedOut && samples.length >= MIN_SAMPLES)
      ) {
        const avg = samples.reduce((sum, n) => sum + n, 0) / samples.length;
        if (avg >= AGE_MINIMUM) {
          finishPassed();
        } else {
          setPhase("denied");
        }
        return;
      }

      if (timedOut && samples.length < MIN_SAMPLES) {
        setMessage(
          "Não detectamos o rosto a tempo. Centralize o rosto, melhore a luz e tente novamente.",
        );
        setPhase("error");
        return;
      }

      await new Promise((r) => window.setTimeout(r, SCAN_FRAME_MS));
    }
  }, [finishPassed]);

  useEffect(() => {
    if (phase !== "active" || !cameraReady || !modelsReady) return;
    void runScan();
    return () => {
      scanAbortRef.current = true;
    };
  }, [phase, cameraReady, modelsReady, runScan]);

  const beginVerification = useCallback(() => {
    scanAbortRef.current = true;
    setMessage("");
    setProgress(0);
    setCameraReady(false);
    setModelsReady(false);
    setPhase("active");
    void ensureModels();
  }, [ensureModels]);

  if (!open) {
    return null;
  }

  const busy = phase === "active";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#0c0414]/55 backdrop-blur-xl"
        aria-label="Fechar verificação"
        onClick={() => {
          if (busy) return;
          if (phase !== "denied") closeVerification();
        }}
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#12081c] text-white shadow-2xl shadow-black/50">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-widest text-luxury-accent">
            +18
          </p>
          <h2
            id="age-gate-title"
            className="mt-2 font-serif text-xl font-bold italic leading-snug sm:text-2xl"
          >
            Verificação rápida de idade
          </h2>
        </div>

        <div className="space-y-4 px-6 py-5 text-sm leading-relaxed text-white/70">
          <p>
            Fotos e contato exigem confirmação de que você tem 18 anos ou mais. A
            câmera analisa por alguns segundos <strong className="text-white/90">só neste aparelho</strong> — nada é
            salvo nem enviado ao servidor.
          </p>

          {busy && (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored
                videoConstraints={{
                  facingMode: "user",
                  width: { ideal: 640 },
                  height: { ideal: 480 },
                }}
                playsInline
                screenshotFormat="image/jpeg"
                onUserMedia={() => setCameraReady(true)}
                onUserMediaError={() => {
                  scanAbortRef.current = true;
                  setMessage(
                    "Permissão da câmera negada. Autorize o acesso nas configurações do navegador.",
                  );
                  setPhase("error");
                }}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="space-y-2 px-4 py-3">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>
                    {!modelsReady
                      ? "Preparando…"
                      : !cameraReady
                        ? "Abrindo câmera…"
                        : "Olhe para a câmera"}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-luxury-accent transition-[width] duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {phase === "passed" && (
            <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-200">
              Pronto. Conteúdo liberado.
            </p>
          )}

          {phase === "denied" && (
            <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
              Não foi possível confirmar 18+. O conteúdo sensível continua
              bloqueado.
            </p>
          )}

          {phase === "error" && (
            <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-100">
              {message || "Algo deu errado. Tente novamente."}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 px-6 py-5 sm:flex-row sm:justify-end">
          {(phase === "intro" || phase === "error") && (
            <>
              <button
                type="button"
                onClick={closeVerification}
                className="order-2 rounded-full border border-white/15 px-5 py-3 text-center text-sm font-bold text-white/70 hover:bg-white/5 sm:order-1"
              >
                Agora não
              </button>
              <button
                type="button"
                onClick={beginVerification}
                className="order-1 rounded-full bg-luxury-accent px-5 py-3 text-sm font-bold text-[#0c0414] hover:bg-luxury-accent-hover sm:order-2"
              >
                {phase === "error" ? "Tentar novamente" : "Usar a câmera"}
              </button>
            </>
          )}

          {phase === "denied" && (
            <>
              <button
                type="button"
                onClick={closeVerification}
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white/70 hover:bg-white/5"
              >
                Fechar
              </button>
              <a
                href={EXIT_URL}
                className="rounded-full bg-white/10 px-5 py-3 text-center text-sm font-bold text-white hover:bg-white/15"
              >
                Sair do site
              </a>
            </>
          )}

          {busy && (
            <p className="w-full text-center text-xs text-white/50">
              Rosto centralizado e boa iluminação ajudam.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}