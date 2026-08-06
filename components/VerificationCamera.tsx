"use client";

import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

type FacingMode = "user" | "environment";

interface VerificationCameraProps {
  facingMode: FacingMode;
  onCapture: (file: File) => void;
  label: string;
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mime });
}

export function VerificationCamera({
  facingMode,
  onCapture,
  label,
}: VerificationCameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);

  const start = () => {
    setError("");
    setCameraReady(false);
    setActive(true);
  };

  const stop = () => {
    setActive(false);
    setCameraReady(false);
  };

  const capture = useCallback(() => {
    const shot = webcamRef.current?.getScreenshot();
    if (!shot) {
      setError("Não foi possível capturar a foto. Tente novamente.");
      return;
    }

    const prefix = facingMode === "user" ? "perfil" : "documento";
    const file = dataUrlToFile(shot, `${prefix}-${Date.now()}.jpg`);
    onCapture(file);
    stop();
  }, [facingMode, onCapture]);

  return (
    <div className="space-y-3">
      {!active ? (
        <button
          type="button"
          onClick={start}
          className="flex w-full items-center justify-center gap-2 rounded border border-purple-800/20 bg-[#faf6ef] py-3 text-base font-medium text-purple-900 hover:bg-[#f3ebe0]"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Abrir câmera — {label}
        </button>
      ) : (
        <div className="overflow-hidden rounded border border-gray-200 bg-black">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.92}
            forceScreenshotSourceSize
            mirrored={facingMode === "user"}
            videoConstraints={{
              facingMode: { ideal: facingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }}
            className="aspect-[3/4] w-full object-cover"
            onUserMedia={() => {
              setCameraReady(true);
              setError("");
            }}
            onUserMediaError={(err) => {
              const msg =
                typeof err === "string"
                  ? err
                  : err.name === "NotAllowedError"
                    ? "Permissão da câmera negada. Autorize o acesso nas configurações do navegador."
                    : "Não foi possível acessar a câmera.";
              setError(msg);
              setActive(false);
            }}
          />

          <div className="flex gap-2 bg-white p-3">
            <button
              type="button"
              onClick={stop}
              className="flex-1 rounded border border-gray-300 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={capture}
              disabled={!cameraReady}
              className="flex-1 rounded-full bg-[#0c0414] py-2.5 text-base font-medium text-white hover:bg-purple-900 disabled:opacity-50"
            >
              Tirar foto
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
