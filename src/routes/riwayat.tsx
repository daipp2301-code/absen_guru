import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Download,
  FileSpreadsheet,
  Calendar,
  Filter,
  CalendarCheck,
  Clock,
  History,
  SlidersHorizontal,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FotoTersimpan } from "@/components/FotoTersimpan";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatJam, formatTanggal } from "@/lib/geo";
import { eksporExcel, eksporPdf } from "@/lib/export";

export const Route = createFileRoute("/riwayat")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Riwayat Absensi Saya | Absensi Guru MTS Math'laul Anwar Napal" },
      {
        name: "description",
        content: "Lihat riwayat absensi pribadi lengkap dengan foto, jam masuk, jam pulang, dan status.",
      },
      { property: "og:title", content: "Riwayat Absensi Saya" },
      { property: "og:description", content: "Riwayat kehadiran pribadi guru beserta foto absensi." },
    ],
  }),
  component: Riwayat,
});

type Baris = {
  id: string;
  tanggal: string;
  jam_masuk: string | null;
  jam_keluar: string | null;
  status: string;
  jarak: number | null;
  foto_masuk: string | null;
  foto_keluar: string | null;
};

function StatusBadge({ status }: { status: string }) {
  const config = {
    hadir: "bg-success/10 text-success border-success/20",
    terlambat: "bg-destructive/10 text-destructive border-destructive/20",
  };
  const cls = config[status as keyof typeof config] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cls} capitalize`}>
      {status === "hadir" ? "✓" : status === "terlambat" ? "⚠" : ""}
      {" "}{status}
    </span>
  );
}

export function TabelRiwayat({ data }: { data: Baris[] }) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-muted-foreground gap-2">
        <History className="size-12 opacity-20" />
        <p className="text-sm font-medium">Belum ada data absensi.</p>
        <p className="text-xs opacity-60">Data akan muncul setelah Anda melakukan absensi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((r, i) => (
        <div
          key={r.id}
          className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border border-border hover:border-primary/20 hover:bg-muted/30 transition-all duration-150"
          style={{ animationDelay: `${i * 30}ms` }}
        >
          {/* Date */}
          <div className="flex items-center gap-3 sm:w-36 shrink-0">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <CalendarCheck className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground whitespace-nowrap">{formatTanggal(r.tanggal)}</p>
              <StatusBadge status={r.status} />
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-10 bg-border shrink-0" />

          {/* Times */}
          <div className="flex items-center gap-4 sm:gap-6 flex-1">
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Masuk</p>
              <p className="text-sm font-bold text-foreground tabular-nums">{formatJam(r.jam_masuk)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Pulang</p>
              <p className="text-sm font-bold text-foreground tabular-nums">{formatJam(r.jam_keluar)}</p>
            </div>
            {r.jarak !== null && (
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Jarak</p>
                <p className="text-sm font-bold text-foreground">{r.jarak} m</p>
              </div>
            )}
          </div>

          {/* Photos */}
          <div className="flex items-center gap-2 shrink-0">
            {r.foto_masuk && (
              <div className="flex flex-col items-center gap-0.5">
                <FotoTersimpan path={r.foto_masuk} alt="Foto masuk" />
                <p className="text-[9px] text-muted-foreground">Masuk</p>
              </div>
            )}
            {r.foto_keluar && (
              <div className="flex flex-col items-center gap-0.5">
                <FotoTersimpan path={r.foto_keluar} alt="Foto pulang" />
                <p className="text-[9px] text-muted-foreground">Pulang</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Riwayat() {
  const { guru } = useAuth();
  const [data, setData] = useState<Baris[]>([]);
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");

  useEffect(() => {
    if (!guru) return;
    void (async () => {
      let q = supabase
        .from("attendance")
        .select("*")
        .eq("teacher_id", guru.id)
        .order("tanggal", { ascending: false });
      if (dari) q = q.gte("tanggal", dari);
      if (sampai) q = q.lte("tanggal", sampai);
      const { data: rows } = await q;
      setData((rows as Baris[]) ?? []);
    })();
  }, [guru, dari, sampai]);

  const barisEkspor = data.map((r) => ({
    Tanggal: formatTanggal(r.tanggal),
    "Jam Masuk": formatJam(r.jam_masuk),
    "Jam Pulang": formatJam(r.jam_keluar),
    Status: r.status,
    "Jarak (m)": r.jarak ?? "-",
  }));

  // Stats
  const totalHadir = data.filter((r) => r.status === "hadir").length;
  const totalTerlambat = data.filter((r) => r.status === "terlambat").length;

  return (
    <AppLayout judul="Riwayat Absensi Saya">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Summary cards */}
        {data.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="card-surface p-4 text-center">
              <p className="text-2xl font-extrabold text-foreground">{data.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Hari</p>
            </div>
            <div className="card-surface p-4 text-center">
              <p className="text-2xl font-extrabold text-success">{totalHadir}</p>
              <p className="text-xs text-muted-foreground mt-1">Tepat Waktu</p>
            </div>
            <div className="card-surface p-4 text-center">
              <p className="text-2xl font-extrabold text-destructive">{totalTerlambat}</p>
              <p className="text-xs text-muted-foreground mt-1">Terlambat</p>
            </div>
          </div>
        )}

        {/* Filter and export */}
        <div className="card-surface p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-border mb-4">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
              <SlidersHorizontal className="size-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Filter & Ekspor</h3>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dari" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3" /> Dari tanggal
              </Label>
              <Input
                id="dari"
                type="date"
                value={dari}
                onChange={(e) => setDari(e.target.value)}
                className="rounded-xl border-border bg-muted/30 h-10 text-sm w-40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sampai" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3" /> Sampai tanggal
              </Label>
              <Input
                id="sampai"
                type="date"
                value={sampai}
                onChange={(e) => setSampai(e.target.value)}
                className="rounded-xl border-border bg-muted/30 h-10 text-sm w-40"
              />
            </div>

            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => eksporExcel("riwayat-absensi-saya", barisEkspor)}
                className="flex items-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-muted/40 text-sm font-medium text-foreground hover:bg-muted hover:border-primary/30 transition-all duration-200"
              >
                <FileSpreadsheet className="size-4 text-success" />
                Excel
              </button>
              <button
                onClick={() =>
                  void eksporPdf(
                    "Riwayat Absensi Saya",
                    ["Tanggal", "Jam Masuk", "Jam Pulang", "Status", "Jarak (m)"],
                    barisEkspor.map((b) => Object.values(b)),
                  )
                }
                className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all duration-200 shadow-sm"
              >
                <Download className="size-4" />
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Data list */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-info/10">
                <History className="size-4 text-info" />
              </div>
              <h3 className="font-semibold text-foreground">Daftar Absensi</h3>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              {data.length} data
            </span>
          </div>

          <TabelRiwayat data={data} />
        </div>
      </div>
    </AppLayout>
  );
}
