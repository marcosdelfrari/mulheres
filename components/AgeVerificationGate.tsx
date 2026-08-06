"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useAgeGate } from "@/lib/age-gate-context";
import { AGE_MINIMUM, AGE_SCAN_MS } from "@/lib/age-gate";

type GatePhase =
  | "intro"
  | "loading_models"
  | "ready_camera"
  | "scanning"
  | "passed"
  | "denied"
  | "error";

const MODEL_URL = "/models/face-api";
const EXIT_URL = "https://www.google.com";

export function AgeVerificationGate() {
  const { open, closeVerification, completeVerification } = useAgeGate();

  const webcamRef = useRef<Webcam>(null);
  const agesRef = useRef<number[]>([]);
  const loopActiveRef = useRef(false);
  const expectCameraRef = useRef(false);
  const faceapiRef = useRef<typeof import("@vladmandic/face-api") | null>(
    null,
  );

  const [phase, setPhase] = useState<GatePhase>("intro");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) {
      loopActiveRef.current = false;
      expectCameraRef.current = false;
      setPhase("intro");
      setProgress(0);
      setMessage("");
      return;
    }
    setPhase("intro");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    return () => {
      loopActiveRef.current = false;
    };
  }, []);

  const finishPassed = useCallback(() => {
    setPhase("passed");
    window.setTimeout(() => {
      completeVerification();
    }, 800);
  }, [completeVerification]);

  const startScanLoop = useCallback(async () => {
    const faceapi = faceapiRef.current;
    if (!faceapi) {
      setMessage("Modelos de verificação indisponíveis.");
      setPhase("error");
      return;
    }

    agesRef.current = [];
    setProgress(0);
    setPhase("scanning");
    loopActiveRef.current = true;
    const startedAt = performance.now();

    const tick = async () => {
      if (!loopActiveRef.current) return;

      const elapsed = performance.now() - startedAt;
      setProgress(Math.min(100, Math.round((elapsed / AGE_SCAN_MS) * 100)));

      const video = webcamRef.current?.video;
      if (video && video.readyState >= 2) {
        try {
          const detection = await faceapi
            .detectSingleFace(
              video,
              new faceapi.TinyFaceDetectorOptions({
                inputSize: 224,
                scoreThreshold: 0.4,
              }),
            )
            .withAgeAndGender();
          if (detection?.age != null) {
            agesRef.current.push(detection.age);
          }
        } catch {
          // ignora frame
        }
      }

      if (!loopActiveRef.current) return;

      if (elapsed >= AGE_SCAN_MS) {
        loopActiveRef.current = false;
        const samples = agesRef.current;
        if (samples.length < 3) {
          setMessage(
            "Não foi possível analisar o rosto com segurança. Centralize o rosto na câmera com boa iluminação e tente de novo.",
          );
          setPhase("error");
          return;
        }
        const avg = samples.reduce((sum, n) => sum + n, 0) / samples.length;
        if (avg >= AGE_MINIMUM) {
          finishPassed();
        } else {
          setPhase("denied");
        }
        return;
      }

      window.setTimeout(() => {
        void tick();
      }, 120);
    };

    void tick();
  }, [finishPassed]);

  const beginVerification = useCallback(async () => {
    loopActiveRef.current = false;
    setMessage("");
    setProgress(0);
    setPhase("loading_models");

    try {
      const faceapi = await import("@vladmandic/face-api");
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
      ]);
      faceapiRef.current = faceapi;
      expectCameraRef.current = true;
      setPhase("ready_camera");
    } catch {
      setMessage(
        "Não foi possível carregar a verificação facial. Atualize a página e tente novamente.",
      );
      setPhase("error");
    }
  }, []);

  if (!open) {
    return null;
  }

  const showCamera =
    phase === "ready_camera" ||
    phase === "scanning" ||
    phase === "loading_models";

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
          if (phase === "scanning" || phase === "loading_models" || phase === "ready_camera") {
            return;
          }
          if (phase !== "denied") {
            closeVerification();
          }
        }}
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#12081c] text-white shadow-2xl shadow-black/50">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-widest text-luxury-accent">
            Verificação etária · ECA
          </p>
          <h2
            id="age-gate-title"
            className="mt-2 font-serif text-2xl font-bold italic leading-snug"
          >
            Conteúdo exclusivo para maiores de 18 anos
          </h2>
        </div>

        <div className="space-y-4 px-6 py-5 text-sm leading-relaxed text-white/70">
          <p>
            Conforme o{" "}
            <strong className="font-semibold text-white/90">
              Estatuto da Criança e do Adolescente (ECA — Lei nº 8.069/1990)
            </strong>
            , fotos e contato exigem verificação de idade. A análise usa a
            câmera por cerca de 3 segundos — processada neste dispositivo, sem
            gravar ou enviar a imagem.
          </p>

          {showCamera && phase !== "loading_models" && (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: "user",
                  width: { ideal: 640 },
                  height: { ideal: 480 },
                }}
                onUserMedia={() => {
                  if (!expectCameraRef.current) return;
                  expectCameraRef.current = false;
                  void startScanLoop();
                }}
                onUserMediaError={() => {
                  expectCameraRef.current = false;
                  loopActiveRef.current = false;
                  setMessage(
                    "Permissão da câmera negada. Autorize o acesso para continuar a verificação.",
                  );
                  setPhase("error");
                }}
                className="aspect-[4/3] w-full object-cover"
              />
              {(phase === "scanning" || phase === "ready_camera") && (
                <div className="space-y-2 px-4 py-3">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>
                      {phase === "ready_camera"
                        ? "Iniciando câmera…"
                        : "Analisando rosto…"}
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
              )}
            </div>
          )}

          {phase === "loading_models" && (
            <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/70">
              Preparando análise facial…
            </p>
          )}

          {phase === "passed" && (
            <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-200">
              Verificação concluída. Fotos e contato liberados.
            </p>
          )}

          {phase === "denied" && (
            <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
              A análise não confirmou idade mínima de 18 anos. Fotos e contato
              permanecem bloqueados.
            </p>
          )}

          {phase === "error" && (
            <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-100">
              {message || "Ocorreu um erro na verificação."}
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
                onClick={() => void beginVerification()}
                className="order-1 rounded-full bg-luxury-accent px-5 py-3 text-sm font-bold text-[#0c0414] hover:bg-luxury-accent-hover sm:order-2"
              >
                {phase === "error" ? "Tentar novamente" : "Verificar meu rosto"}
              </button>
            </>
          )}

          {phase === "denied" && (
            <>
              <button
                type="button"
                onClick={closeVerification}
                className="order-2 rounded-full border border-white/15 px-5 py-3 text-center text-sm font-bold text-white/70 hover:bg-white/5 sm:order-1"
              >
                Fechar
              </button>
              <a
                href={EXIT_URL}
                className="order-1 rounded-full bg-white/10 px-5 py-3 text-center text-sm font-bold text-white hover:bg-white/15 sm:order-2"
              >
                Sair do site
              </a>
            </>
          )}

          {(phase === "loading_models" ||
            phase === "ready_camera" ||
            phase === "scanning") && (
            <p className="w-full text-center text-xs text-white/50">
              Mantenha o rosto centralizado e bem iluminado por 3 segundos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
