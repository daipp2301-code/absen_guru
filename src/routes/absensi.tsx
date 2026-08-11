import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  Navigation,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Camera,
  RotateCcw,
  X,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { CameraCapture } from "@/components/CameraCapture";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ambilLokasi, formatJam, hitungJarakMeter, tanggalHariIni } from "@/lib/geo";
import { unggahFoto } from "@/lib/storage";

const MapView = lazy(() => import("@/components/MapView"));

export const Route = createFileRoute("/absensi")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Absensi Masuk & Pulang | Absensi Guru MTS Math'laul Anwar Napal" },
      {
        name: "description",
        content:
          "Lakukan absensi masuk dan pulang dengan verifikasi lokasi GPS dan foto selfie langsung dari perangkat.",
      },
      { property: "og:title", content: "Absensi Masuk & Pulang" },
      { property: "og:description", content: "Absensi guru dengan verifikasi GPS dan foto selfie." },
    ],
  }),
  component: Absensi,
});

type Sekolah = {
  id: string;
  nama_sekolah: string;
  latitude: number;
  longitude: number;
  radius: number;
  jam_masuk: string;
  jam_pulang: string;
};

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-center">
      <p className="text-4xl font-extrabold tabular-nums text-foreground">
        {now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </p>
      <p className="text-sm text-muted-foreground mt-1 capitalize">
        {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </p>
    </div>
  );
}

function LocationStatus({
  jarak,
  sekolah,
  dalamRadius,
  memuatLokasi,
  onRefresh,
}: {
  jarak: number | null;
  sekolah: Sekolah | null;
  dalamRadius: boolean;
  memuatLokasi: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-3">
      {/* Location validity indicator */}
      <div
        className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-300 ${
          jarak === null
            ? "bg-muted/50 border-border"
            : dalamRadius
              ? "bg-success/8 border-success/25"
              : "bg-destructive/8 border-destructive/25"
        }`}
      >
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
            jarak === null
              ? "bg-muted"
              : dalamRadius
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive"
          }`}
        >
          {memuatLokasi ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : jarak === null ? (
            <Navigation className="size-5 text-muted-foreground" />
          ) : dalamRadius ? (
            <ShieldCheck className="size-5 location-valid" />
          ) : (
            <AlertTriangle className="size-5 location-invalid" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-semibold ${
              jarak === null
                ? "text-muted-foreground"
                : dalamRadius
                  ? "location-valid"
                  : "location-invalid"
            }`}
          >
            {jarak === null
              ? "Mendeteksi lokasi..."
              : dalamRadius
                ? "Lokasi Valid ✓"
                : "Di Luar Area Sekolah"}
          </p>
          {jarak !== null && !dalamRadius && (
            <p className="text-xs text-destructive/80 mt-0.5">
              Anda berada di luar area sekolah. Silakan mendekati lokasi sekolah.
            </p>
          )}
          {jarak !== null && dalamRadius && (
            <p className="text-xs text-success/80 mt-0.5">
              Anda berada dalam area sekolah. Absensi dapat dilakukan.
            </p>
          )}
        </div>
      </div>

      {/* Distance & radius info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="size-3.5 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Jarak</p>
          </div>
          <p className="text-lg font-bold text-foreground">
            {jarak === null ? "–" : `${jarak} m`}
          </p>
        </div>
        <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldCheck className="size-3.5 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Radius</p>
          </div>
          <p className="text-lg font-bold text-foreground">
            {sekolah ? `${sekolah.radius} m` : "–"}
          </p>
        </div>
      </div>

      {/* Refresh button */}
      <button
        onClick={onRefresh}
        disabled={memuatLokasi}
        className="flex w-full items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-muted/30 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 disabled:opacity-50"
      >
        {memuatLokasi ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RefreshCw className="size-4" />
        )}
        {memuatLokasi ? "Memperbarui..." : "Perbarui Lokasi"}
      </button>
    </div>
  );
}

function Absensi() {
  const { guru } = useAuth();
  const [sekolah, setSekolah] = useState<Sekolah | null>(null);
  const [posisi, setPosisi] = useState<{ lat: number; lng: number } | null>(null);
  const [jarak, setJarak] = useState<number | null>(null);
  const [memuatLokasi, setMemuatLokasi] = useState(false);
  const [mode, setMode] = useState<"masuk" | "keluar" | null>(null);
  const [foto, setFoto] = useState<{ blob: Blob; preview: string } | null>(null);
  const [proses, setProses] = useState(false);
  const [absen, setAbsen] = useState<{
    id: string;
    jam_masuk: string | null;
    jam_keluar: string | null;
    status: string;
  } | null>(null);

  const muatAbsen = useCallback(async () => {
    if (!guru) return;
    const { data } = await supabase
      .from("attendance")
      .select("id,jam_masuk,jam_keluar,status")
      .eq("teacher_id", guru.id)
      .eq("tanggal", tanggalHariIni())
      .maybeSingle();
    setAbsen(data ?? null);
  }, [guru]);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from("school_settings").select("*").limit(1).maybeSingle();
      setSekolah((data as Sekolah) ?? null);
      await muatAbsen();
    })();
  }, [muatAbsen]);

  const perbaruiLokasi = useCallback(async () => {
    if (!sekolah) return;
    setMemuatLokasi(true);
    try {
      const pos = await ambilLokasi();
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setPosisi({ lat, lng });
      setJarak(hitungJarakMeter(lat, lng, sekolah.latitude, sekolah.longitude));
    } catch {
      toast.error("Gagal membaca lokasi. Aktifkan GPS dan izinkan akses lokasi.");
    } finally {
      setMemuatLokasi(false);
    }
  }, [sekolah]);

  useEffect(() => {
    if (sekolah) void perbaruiLokasi();
  }, [sekolah, perbaruiLokasi]);

  const dalamRadius = sekolah && jarak !== null ? jarak <= sekolah.radius : false;

  const simpan = async () => {
    if (!guru || !sekolah || !posisi || jarak === null || !foto || !mode) return;
    if (!dalamRadius) {
      toast.error("Anda berada di luar radius sekolah. Silakan mendekati lokasi sekolah untuk melakukan absensi.");
      return;
    }
    setProses(true);
    try {
      const path = await unggahFoto(foto.blob, `absensi/${guru.id}`);
      const sekarang = new Date().toISOString();

      if (mode === "masuk") {
        const jamBatas = new Date(`${tanggalHariIni()}T${sekolah.jam_masuk}`);
        const status = new Date() > jamBatas ? "terlambat" : "hadir";
        const { error } = await supabase.from("attendance").upsert(
          {
            teacher_id: guru.id,
            tanggal: tanggalHariIni(),
            jam_masuk: sekarang,
            status,
            latitude: posisi.lat,
            longitude: posisi.lng,
            jarak,
            foto_masuk: path,
          },
          { onConflict: "teacher_id,tanggal" },
        );
        if (error) throw new Error(error.message);
        toast.success(status === "terlambat" ? "Absen masuk tercatat (terlambat)" : "Absen masuk berhasil! ✓");
      } else {
        if (!absen) throw new Error("Anda belum melakukan absen masuk hari ini");
        const { error } = await supabase
          .from("attendance")
          .update({ jam_keluar: sekarang, foto_keluar: path })
          .eq("id", absen.id);
        if (error) throw new Error(error.message);
        toast.success("Absen pulang berhasil! ✓");
      }

      await supabase.from("activity_logs").insert({
        user_id: (await supabase.auth.getUser()).data.user?.id ?? null,
        aksi: mode === "masuk" ? "Absen Masuk" : "Absen Pulang",
        keterangan: `Jarak ${jarak} m dari sekolah`,
      });

      setFoto(null);
      setMode(null);
      await muatAbsen();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan absensi");
    } finally {
      setProses(false);
    }
  };

  if (!guru) {
    return (
      <AppLayout judul="Absensi">
        <div className="card-surface p-8 text-center max-w-md mx-auto">
          <MapPin className="size-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Akun ini bukan akun guru, sehingga tidak memiliki halaman absensi.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout judul="Absensi Masuk & Pulang">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Clock and date banner */}
        <div className="card-surface p-5 text-center">
          <LiveClock />

          {/* Today's attendance status */}
          <div className="flex items-center justify-center gap-6 mt-5 pt-5 border-t border-border">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Jam Masuk</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {formatJam(absen?.jam_masuk)}
              </p>
              {absen?.status && (
                <span className={`inline-flex items-center mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  absen.status === "terlambat"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-success/10 text-success"
                }`}>
                  {absen.status}
                </span>
              )}
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Jam Pulang</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {formatJam(absen?.jam_keluar)}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          {mode === null && (
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setMode("masuk")}
                disabled={!!absen?.jam_masuk}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:bg-primary/90 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <LogIn className="size-4" />
                Absen Masuk
              </button>
              <button
                onClick={() => setMode("keluar")}
                disabled={!absen?.jam_masuk || !!absen?.jam_keluar}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-primary text-primary font-semibold text-sm transition-all duration-200 hover:bg-primary/8 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <LogOut className="size-4" />
                Absen Pulang
              </button>
            </div>
          )}
        </div>

        {/* Camera & Location grid */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Location panel */}
          <div className="card-surface p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex size-8 items-center justify-center rounded-xl bg-info/10">
                <Navigation className="size-4 text-info" />
              </div>
              <h3 className="font-semibold text-foreground">Status Lokasi</h3>
            </div>

            <LocationStatus
              jarak={jarak}
              sekolah={sekolah}
              dalamRadius={dalamRadius}
              memuatLokasi={memuatLokasi}
              onRefresh={() => void perbaruiLokasi()}
            />

            {/* Map */}
            {sekolah && (
              <div>
                <Suspense
                  fallback={
                    <div className="h-52 w-full animate-pulse rounded-xl bg-muted shimmer-loading" />
                  }
                >
                  <MapView
                    lat={sekolah.latitude}
                    lng={sekolah.longitude}
                    radius={sekolah.radius}
                    posisiSaya={posisi}
                    className="h-52 w-full rounded-xl border border-border"
                  />
                </Suspense>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  🟢 Sekolah &nbsp;|&nbsp; 🔵 Posisi Anda
                </p>
              </div>
            )}
          </div>

          {/* Camera / Photo panel */}
          <div className="card-surface p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
                <Camera className="size-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">
                {mode === null
                  ? "Foto Absensi"
                  : mode === "masuk"
                    ? "Foto Absen Masuk"
                    : "Foto Absen Pulang"}
              </h3>
            </div>

            {mode === null && !foto && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-muted mb-4">
                  <Camera className="size-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Pilih tombol <strong>Absen Masuk</strong> atau <strong>Absen Pulang</strong> untuk mengaktifkan kamera.
                </p>
              </div>
            )}

            {mode !== null && !foto && (
              <div>
                <CameraCapture
                  onAmbil={(blob, preview) => setFoto({ blob, preview })}
                  onBatal={() => setMode(null)}
                />
              </div>
            )}

            {mode !== null && foto && (
              <div className="space-y-4">
                {/* Photo preview */}
                <div className="relative rounded-2xl overflow-hidden border border-border">
                  <img src={foto.preview} alt="Pratinjau foto absensi" className="w-full aspect-[4/3] object-cover" />
                  {/* Camera corner overlays */}
                  <div className="camera-overlay" />
                  <div className="camera-corner camera-corner-tl" />
                  <div className="camera-corner camera-corner-tr" />
                  <div className="camera-corner camera-corner-bl" />
                  <div className="camera-corner camera-corner-br" />
                  {/* Mode label */}
                  <div className="absolute top-3 left-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {mode === "masuk" ? "Absen Masuk" : "Absen Pulang"}
                  </div>
                </div>

                {/* Location validation message */}
                {!dalamRadius && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/8 border border-destructive/25">
                    <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-xs text-destructive leading-relaxed">
                      Anda berada di luar area sekolah. Silakan mendekati lokasi sekolah untuk melakukan absensi.
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => void simpan()}
                    disabled={proses || !dalamRadius}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {proses ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    {proses ? "Mengirim..." : `Kirim Absen ${mode === "masuk" ? "Masuk" : "Pulang"}`}
                  </button>
                  <button
                    onClick={() => setFoto(null)}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-muted/40 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
                  >
                    <RotateCcw className="size-4" />
                    Ulang
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* School info */}
        {sekolah && (
          <div className="card-surface p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                <MapPin className="size-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{sekolah.nama_sekolah}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Jam masuk: {sekolah.jam_masuk} &nbsp;|&nbsp; Jam pulang: {sekolah.jam_pulang} &nbsp;|&nbsp; Radius: {sekolah.radius} m
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
