import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  KeyRound,
  Loader2,
  Save,
  Upload,
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FotoTersimpan } from "@/components/FotoTersimpan";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { unggahFoto } from "@/lib/storage";
import { perbaruiKredensial } from "@/lib/admin.functions";

export const Route = createFileRoute("/profil")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Profil Pengguna | Absensi Guru MTS Math'laul Anwar Napal" },
      {
        name: "description",
        content: "Ubah foto profil, nama lengkap, nomor telepon, alamat, email, username, dan kata sandi.",
      },
      { property: "og:title", content: "Profil Pengguna" },
      { property: "og:description", content: "Kelola data pribadi dan kredensial akun Anda." },
    ],
  }),
  component: Profil,
});

function FormField({
  id,
  label,
  icon: Icon,
  children,
}: {
  id: string;
  label: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon className="size-3.5 text-muted-foreground" />
        {label}
      </label>
      {children}
    </div>
  );
}

function Profil() {
  const { profil, session, muatUlang } = useAuth();
  const [form, setForm] = useState({
    nama_lengkap: "",
    nomor_telepon: "",
    alamat: "",
    email: "",
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [simpanProses, setSimpanProses] = useState(false);
  const [kredProses, setKredProses] = useState(false);
  const [fotoProses, setFotoProses] = useState(false);

  useEffect(() => {
    if (!profil) return;
    setForm({
      nama_lengkap: profil.nama_lengkap ?? "",
      nomor_telepon: profil.nomor_telepon ?? "",
      alamat: profil.alamat ?? "",
      email: profil.email ?? "",
    });
    setUsername(profil.username ?? "");
  }, [profil]);

  const simpanProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profil) return;
    setSimpanProses(true);
    try {
      const { error } = await supabase.from("profiles").update(form).eq("id", profil.id);
      if (error) throw new Error(error.message);
      await supabase
        .from("teachers")
        .update({
          nama_lengkap: form.nama_lengkap,
          nomor_telepon: form.nomor_telepon,
          alamat: form.alamat,
          email: form.email,
        })
        .eq("user_id", profil.id);
      toast.success("Profil berhasil diperbarui ✓");
      await muatUlang();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan profil");
    } finally {
      setSimpanProses(false);
    }
  };

  const gantiFoto = async (file: File) => {
    if (!profil) return;
    setFotoProses(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = await unggahFoto(file, `profil/${profil.id}`, ext);
      await supabase.from("profiles").update({ foto_profil: path }).eq("id", profil.id);
      await supabase.from("teachers").update({ foto_profil: path }).eq("user_id", profil.id);
      toast.success("Foto profil berhasil diperbarui ✓");
      await muatUlang();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah foto");
    } finally {
      setFotoProses(false);
    }
  };

  const simpanKredensial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setKredProses(true);
    try {
      const payload: { userId: string; username?: string; password?: string } = {
        userId: session.user.id,
      };
      if (username && username !== profil?.username) payload.username = username;
      if (password) payload.password = password;
      await perbaruiKredensial({ data: payload });
      toast.success("Kredensial berhasil diperbarui. Gunakan data baru saat masuk berikutnya.");
      setPassword("");
      await muatUlang();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui kredensial");
    } finally {
      setKredProses(false);
    }
  };

  const inisial = (profil?.nama_lengkap || "?").slice(0, 2).toUpperCase();

  return (
    <AppLayout judul="Profil Saya">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">

          {/* Profile photo card */}
          <div className="card-surface p-6 text-center space-y-4 h-fit">
            {/* Avatar */}
            <div className="relative mx-auto w-fit">
              <div className="size-28 rounded-full overflow-hidden ring-4 ring-primary/20 bg-muted">
                {profil?.foto_profil ? (
                  <FotoTersimpan
                    path={profil.foto_profil}
                    alt="Foto profil"
                    className="size-28 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-28 items-center justify-center rounded-full bg-primary/10 text-3xl font-extrabold text-primary">
                    {inisial}
                  </div>
                )}
              </div>

              {/* Upload overlay */}
              <label
                htmlFor="foto-profil"
                className="absolute bottom-0 right-0 flex size-9 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105"
              >
                {fotoProses ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" />
                )}
              </label>
              <input
                id="foto-profil"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void gantiFoto(f);
                }}
              />
            </div>

            {/* Name & role */}
            <div>
              <p className="font-bold text-lg text-foreground">{profil?.nama_lengkap || "–"}</p>
              <p className="text-sm text-muted-foreground">@{profil?.username}</p>
            </div>

            {/* Info chips */}
            <div className="space-y-2 text-left">
              {profil?.email && (
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-muted/50 border border-border/50">
                  <Mail className="size-3.5 text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground truncate">{profil.email}</p>
                </div>
              )}
              {profil?.nomor_telepon && (
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-muted/50 border border-border/50">
                  <Phone className="size-3.5 text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground">{profil.nomor_telepon}</p>
                </div>
              )}
              {profil?.alamat && (
                <div className="flex items-start gap-2.5 px-3 py-2 rounded-xl bg-muted/50 border border-border/50">
                  <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground line-clamp-2">{profil.alamat}</p>
                </div>
              )}
            </div>

            {/* Change photo hint */}
            <p className="text-[11px] text-muted-foreground/70">
              Klik ikon kamera untuk mengubah foto profil
            </p>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Personal data form */}
            <form onSubmit={simpanProfil} className="card-surface p-6 space-y-5">
              <div className="flex items-center gap-2 pb-1 border-b border-border">
                <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
                  <Edit3 className="size-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Data Pribadi</h3>
                  <p className="text-xs text-muted-foreground">Perbarui informasi pribadi Anda</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="nama" label="Nama Lengkap" icon={User}>
                  <Input
                    id="nama"
                    maxLength={100}
                    value={form.nama_lengkap}
                    onChange={(e) => setForm((f) => ({ ...f, nama_lengkap: e.target.value }))}
                    placeholder="Nama lengkap Anda"
                    className="rounded-xl border-border bg-muted/30 focus:bg-card transition-colors"
                  />
                </FormField>
                <FormField id="telepon" label="Nomor Telepon" icon={Phone}>
                  <Input
                    id="telepon"
                    maxLength={20}
                    value={form.nomor_telepon}
                    onChange={(e) => setForm((f) => ({ ...f, nomor_telepon: e.target.value }))}
                    placeholder="08xxxxxxxxxx"
                    className="rounded-xl border-border bg-muted/30 focus:bg-card transition-colors"
                  />
                </FormField>
                <div className="sm:col-span-2">
                  <FormField id="email" label="Alamat Email" icon={Mail}>
                    <Input
                      id="email"
                      type="email"
                      maxLength={255}
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="email@contoh.com"
                      className="rounded-xl border-border bg-muted/30 focus:bg-card transition-colors"
                    />
                  </FormField>
                </div>
                <div className="sm:col-span-2">
                  <FormField id="alamat" label="Alamat" icon={MapPin}>
                    <Textarea
                      id="alamat"
                      maxLength={300}
                      rows={3}
                      value={form.alamat}
                      onChange={(e) => setForm((f) => ({ ...f, alamat: e.target.value }))}
                      placeholder="Alamat lengkap Anda"
                      className="rounded-xl border-border bg-muted/30 focus:bg-card transition-colors resize-none"
                    />
                  </FormField>
                </div>
              </div>

              <button
                type="submit"
                disabled={simpanProses}
                className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:bg-primary/90 disabled:opacity-60 shadow-sm hover:shadow-md"
              >
                {simpanProses ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {simpanProses ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>

            {/* Credentials form */}
            <form onSubmit={simpanKredensial} className="card-surface p-6 space-y-5">
              <div className="flex items-center gap-2 pb-1 border-b border-border">
                <div className="flex size-8 items-center justify-center rounded-xl bg-warning/10">
                  <KeyRound className="size-4 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Username & Kata Sandi</h3>
                  <p className="text-xs text-muted-foreground">Ubah kredensial masuk Anda</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="user" label="Username" icon={User}>
                  <Input
                    id="user"
                    maxLength={50}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username baru"
                    className="rounded-xl border-border bg-muted/30 focus:bg-card transition-colors"
                  />
                </FormField>
                <FormField id="pass" label="Kata Sandi Baru" icon={Lock}>
                  <div className="relative">
                    <Input
                      id="pass"
                      type={showPassword ? "text" : "password"}
                      maxLength={72}
                      placeholder="Kosongkan bila tidak diubah"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-xl border-border bg-muted/30 focus:bg-card transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </FormField>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-warning/8 border border-warning/20">
                <KeyRound className="size-4 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-warning leading-relaxed">
                  Setelah mengubah kredensial, Anda perlu masuk ulang menggunakan data yang baru.
                </p>
              </div>

              <button
                type="submit"
                disabled={kredProses}
                className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm border border-border transition-all duration-200 hover:bg-muted disabled:opacity-60"
              >
                {kredProses ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
                {kredProses ? "Memperbarui..." : "Perbarui Kredensial"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
