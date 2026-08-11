import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Loader2,
  Send,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Paperclip,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FotoTersimpan } from "@/components/FotoTersimpan";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatTanggal } from "@/lib/geo";
import { unggahFoto } from "@/lib/storage";

export const KATEGORI_IZIN = [
  "Sakit",
  "Izin Pribadi",
  "Dinas Luar",
  "Cuti",
  "Keperluan Keluarga",
  "Lainnya",
];

export const Route = createFileRoute("/izin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Pengajuan Izin & Cuti | Absensi Guru MTS Math'laul Anwar Napal" },
      {
        name: "description",
        content:
          "Ajukan izin sakit, cuti, dinas luar, atau keperluan keluarga lengkap dengan dokumen pendukung.",
      },
      { property: "og:title", content: "Pengajuan Izin & Cuti" },
      { property: "og:description", content: "Ajukan izin dan pantau status persetujuan." },
    ],
  }),
  component: Izin,
});

const skema = z.object({
  kategori: z.string().min(1, "Kategori wajib dipilih"),
  tanggal_mulai: z.string().min(1, "Tanggal mulai wajib diisi"),
  tanggal_selesai: z.string().min(1, "Tanggal selesai wajib diisi"),
  alasan: z.string().trim().min(5, "Alasan minimal 5 karakter").max(500),
});

type Pengajuan = {
  id: string;
  kategori: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  alasan: string;
  dokumen: string | null;
  status: string;
  catatan_admin: string | null;
};

function StatusBadge({ status }: { status: string }) {
  const config = {
    disetujui: { icon: CheckCircle2, class: "bg-success/10 text-success border-success/20", label: "Disetujui" },
    ditolak: { icon: XCircle, class: "bg-destructive/10 text-destructive border-destructive/20", label: "Ditolak" },
    menunggu: { icon: AlertCircle, class: "bg-warning/10 text-warning border-warning/20", label: "Menunggu" },
  };
  const cfg = config[status as keyof typeof config] ?? config.menunggu;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.class}`}>
      <Icon className="size-3" />
      {cfg.label}
    </span>
  );
}

const kategoriConfig: Record<string, { emoji: string; color: string }> = {
  "Sakit": { emoji: "🤒", color: "bg-destructive/10 text-destructive" },
  "Izin Pribadi": { emoji: "🙋", color: "bg-info/10 text-info" },
  "Dinas Luar": { emoji: "🏢", color: "bg-primary/10 text-primary" },
  "Cuti": { emoji: "🏖️", color: "bg-warning/10 text-warning-foreground" },
  "Keperluan Keluarga": { emoji: "👨‍👩‍👧", color: "bg-purple-100 text-purple-700" },
  "Lainnya": { emoji: "📋", color: "bg-muted text-muted-foreground" },
};

function Izin() {
  const { guru } = useAuth();
  const [daftar, setDaftar] = useState<Pengajuan[]>([]);
  const [form, setForm] = useState({
    kategori: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    alasan: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [proses, setProses] = useState(false);

  const muat = useCallback(async () => {
    if (!guru) return;
    const { data } = await supabase
      .from("leave_requests")
      .select("*")
      .eq("teacher_id", guru.id)
      .order("created_at", { ascending: false });
    setDaftar((data as Pengajuan[]) ?? []);
  }, [guru]);

  useEffect(() => {
    void muat();
  }, [muat]);

  const kirim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guru) return;
    const hasil = skema.safeParse(form);
    if (!hasil.success) {
      toast.error(hasil.error.issues[0]?.message ?? "Data tidak valid");
      return;
    }
    setProses(true);
    try {
      let dokumen: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        dokumen = await unggahFoto(file, `dokumen/${guru.id}`, ext);
      }
      const { error } = await supabase.from("leave_requests").insert({
        teacher_id: guru.id,
        ...hasil.data,
        dokumen,
      });
      if (error) throw new Error(error.message);
      toast.success("Pengajuan izin terkirim, menunggu persetujuan admin ✓");
      setForm({ kategori: "", tanggal_mulai: "", tanggal_selesai: "", alasan: "" });
      setFile(null);
      await muat();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim pengajuan");
    } finally {
      setProses(false);
    }
  };

  if (!guru) {
    return (
      <AppLayout judul="Pengajuan Izin">
        <div className="card-surface p-8 text-center max-w-md mx-auto">
          <FileText className="size-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Halaman ini hanya tersedia untuk akun guru.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout judul="Pengajuan Izin & Cuti">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          {/* Form pengajuan */}
          <form onSubmit={kirim} className="card-surface p-5 space-y-4 h-fit">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
                <Send className="size-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Form Pengajuan</h3>
                <p className="text-xs text-muted-foreground">Isi dengan data yang benar</p>
              </div>
            </div>

            {/* Kategori */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Kategori Izin</Label>
              <Select
                value={form.kategori}
                onValueChange={(v) => setForm((f) => ({ ...f, kategori: v }))}
              >
                <SelectTrigger className="rounded-xl border-border bg-muted/30 h-11">
                  <SelectValue placeholder="Pilih kategori izin" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {KATEGORI_IZIN.map((k) => {
                    const cfg = kategoriConfig[k] ?? { emoji: "📋", color: "" };
                    return (
                      <SelectItem key={k} value={k} className="rounded-lg">
                        <span className="flex items-center gap-2">
                          <span>{cfg.emoji}</span>
                          <span>{k}</span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Tanggal */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="mulai" className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="size-3 text-muted-foreground" />
                  Mulai
                </Label>
                <Input
                  id="mulai"
                  type="date"
                  value={form.tanggal_mulai}
                  onChange={(e) => setForm((f) => ({ ...f, tanggal_mulai: e.target.value }))}
                  className="rounded-xl border-border bg-muted/30 h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="selesai" className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="size-3 text-muted-foreground" />
                  Selesai
                </Label>
                <Input
                  id="selesai"
                  type="date"
                  value={form.tanggal_selesai}
                  onChange={(e) => setForm((f) => ({ ...f, tanggal_selesai: e.target.value }))}
                  className="rounded-xl border-border bg-muted/30 h-11"
                />
              </div>
            </div>

            {/* Alasan */}
            <div className="space-y-1.5">
              <Label htmlFor="alasan" className="text-sm font-medium">Alasan</Label>
              <Textarea
                id="alasan"
                maxLength={500}
                rows={3}
                value={form.alasan}
                onChange={(e) => setForm((f) => ({ ...f, alasan: e.target.value }))}
                placeholder="Jelaskan alasan pengajuan izin..."
                className="rounded-xl border-border bg-muted/30 resize-none"
              />
              <p className="text-[10px] text-muted-foreground text-right">
                {form.alasan.length}/500
              </p>
            </div>

            {/* Dokumen */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Dokumen Pendukung</Label>
              <label
                htmlFor="dokumen-file"
                className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/4 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex size-9 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                  <Paperclip className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {file ? file.name : "Unggah dokumen"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : "PDF, JPG, PNG (opsional)"}
                  </p>
                </div>
              </label>
              <input
                id="dokumen-file"
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <button
              type="submit"
              disabled={proses}
              className="flex w-full items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:bg-primary/90 disabled:opacity-60 shadow-sm hover:shadow-md"
            >
              {proses ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {proses ? "Mengirim..." : "Kirim Pengajuan"}
            </button>
          </form>

          {/* History */}
          <div className="card-surface p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border mb-4">
              <div className="flex size-8 items-center justify-center rounded-xl bg-info/10">
                <Clock className="size-4 text-info" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Riwayat Pengajuan</h3>
                <p className="text-xs text-muted-foreground">{daftar.length} pengajuan</p>
              </div>
            </div>

            {daftar.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-muted-foreground gap-2">
                <FileText className="size-10 opacity-25" />
                <p className="text-sm">Belum ada pengajuan izin.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {daftar.map((p) => {
                  const cfg = kategoriConfig[p.kategori] ?? { emoji: "📋", color: "bg-muted text-muted-foreground" };
                  return (
                    <div key={p.id} className="p-4 rounded-2xl border border-border hover:border-primary/20 hover:bg-muted/30 transition-all duration-150 space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`flex size-8 items-center justify-center rounded-xl text-sm ${cfg.color}`}>
                            {cfg.emoji}
                          </span>
                          <div>
                            <p className="font-semibold text-sm text-foreground">{p.kategori}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {formatTanggal(p.tanggal_mulai)} – {formatTanggal(p.tanggal_selesai)}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={p.status} />
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 pl-10">{p.alasan}</p>

                      {(p.dokumen || p.catatan_admin) && (
                        <div className="flex items-center gap-3 pl-10">
                          {p.dokumen && (
                            <FotoTersimpan path={p.dokumen} alt="Dokumen pendukung" />
                          )}
                          {p.catatan_admin && (
                            <p className="text-[11px] text-muted-foreground italic">
                              Catatan: {p.catatan_admin}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
