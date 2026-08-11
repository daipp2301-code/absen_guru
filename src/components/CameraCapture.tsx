import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, X, FlipHorizontal } from "lucide-react";

export function CameraCapture({
  onAmbil,
  onBatal,
}: {
  onAmbil: (blob: Blob, preview: string) => void;
  onBatal: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [depan, setDepan] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  const [merekam, setMerekam] = useState(false);

  const mulai = useCallback(async (gunakanDepan: boolean) => {
    setGalat(null);
    setMerekam(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: gunakanDepan ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setMerekam(true);
      }
    } catch {
      setGalat("Tidak dapat mengakses kamera. Izinkan akses kamera pada browser Anda dan coba lagi.");
    }
  }, []);

  useEffect(() => {
    void mulai(depan);
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [depan, mulai]);

  const jepret = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror if front camera
    if (depan) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) onAmbil(blob, canvas.toDataURL("image/jpeg", 0.85));
      },
      "image/jpeg",
      0.85,
    );
  };

  return (
    <div className="space-y-3">
      {/* Camera viewport */}
      <div className="relative overflow-hidden rounded-2xl bg-black aspect-[4/3]">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: depan ? "scaleX(-1)" : "none" }}
        />

        {/* Error overlay */}
        {galat && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/20">
              <Camera className="size-6 text-destructive" />
            </div>
            <p className="text-sm text-white/90 leading-relaxed">{galat}</p>
            <button
              onClick={() => void mulai(depan)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
            >
              <RotateCcw className="size-3.5" />
              Coba Lagi
            </button>
          </div>
        )}

        {/* Loading indicator */}
        {!galat && !merekam && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="flex flex-col items-center gap-2">
              <div className="size-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <p className="text-xs text-white/70">Mengaktifkan kamera...</p>
            </div>
          </div>
        )}

        {/* Corner guides */}
        {merekam && (
          <>
            <div className="camera-corner camera-corner-tl" />
            <div className="camera-corner camera-corner-tr" />
            <div className="camera-corner camera-corner-bl" />
            <div className="camera-corner camera-corner-br" />

            {/* Camera mode indicator */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 text-white text-[10px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
              <div className="size-1.5 rounded-full bg-red-500 animate-pulse" />
              {depan ? "Kamera Depan" : "Kamera Belakang"}
            </div>
          </>
        )}

        {/* Flip camera button - overlaid */}
        {merekam && (
          <button
            onClick={() => setDepan((v) => !v)}
            className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-xl bg-black/50 text-white hover:bg-black/70 transition-all duration-200 backdrop-blur-sm"
            aria-label="Ganti kamera"
          >
            <FlipHorizontal className="size-4" />
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Cancel */}
        <button
          onClick={onBatal}
          className="flex items-center justify-center size-11 rounded-xl border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 shrink-0"
        >
          <X className="size-4" />
        </button>

        {/* Capture button */}
        <button
          onClick={jepret}
          disabled={!!galat || !merekam}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          <Camera className="size-4" />
          Ambil Foto
        </button>

        {/* Flip camera (also bottom) */}
        <button
          onClick={() => setDepan((v) => !v)}
          className="flex items-center justify-center size-11 rounded-xl border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 shrink-0"
          aria-label="Ganti kamera"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>
    </div>
  );
}
