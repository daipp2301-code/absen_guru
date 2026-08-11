import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, LogIn, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { seedAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Masuk | Sistem Absensi Guru MTS Math'laul Anwar Napal" },
      {
        name: "description",
        content:
          "Halaman masuk sistem absensi guru MTS Math'laul Anwar Napal menggunakan username dan password.",
      },
      { property: "og:title", content: "Masuk | Absensi Guru MTS Math'laul Anwar Napal" },
      {
        property: "og:description",
        content: "Masuk untuk melakukan absensi, mengajukan izin, dan melihat laporan kehadiran.",
      },
    ],
  }),
  component: Login,
});

function Login() {
  const { masuk, session, memuat, peran } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [proses, setProses] = useState(false);

  useEffect(() => {
    void seedAdmin().catch(() => undefined);
  }, []);

  // Auto-redirect based on role after login
  useEffect(() => {
    if (!memuat && session && peran) {
      console.log('[AUTH] Redirect effect triggered, peran:', peran);
      if (peran === "admin") {
        console.log('[AUTH] Navigating to admin dashboard');
        void navigate({ to: "/dashboard", replace: true });
      } else {
        console.log('[AUTH] Navigating to generic dashboard');
        void navigate({ to: "/dashboard", replace: true });
      }
    }
  }, [memuat, session, peran, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[AUTH] Login submitted');
    setProses(true);
    try {
      await masuk(username, password);
      console.log('[AUTH] masuk resolved');
      toast.success('Berhasil masuk! Selamat datang.');
      // Navigation will be handled by the useEffect above after peran loads
    } catch (err) {
      console.error('[AUTH] Login error:', err);
      toast.error(err instanceof Error ? err.message : 'Gagal masuk. Periksa username dan password.');
    } finally {
      setProses(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left decorative panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 login-bg flex-col relative">
        {/* Floating orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo at top */}
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Logo MTS Math'laul Anwar Napal" className="size-12 drop-shadow-lg" />
            <div>
              <p className="text-white font-bold text-base leading-tight">Sistem Absensi Guru</p>
              <p className="text-white/70 text-xs">MTS Math'laul Anwar Napal</p>
            </div>
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-white/80 text-xs font-medium mb-6 border border-white/20">
                <ShieldCheck className="size-3.5" />
                Sistem Terintegrasi GPS & Foto
              </div>
              <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
                MTS Math'laul
                <br />
                <span className="text-yellow-300">Anwar Napal</span>
              </h1>
              <p className="text-white/75 text-base leading-relaxed">
                Platform absensi modern berbasis lokasi GPS dan foto selfie untuk memastikan kehadiran yang akurat dan transparan.
              </p>
            </div>

            {/* Feature list */}
            <div className="grid grid-cols-1 gap-3">
              {[
                { icon: "📍", title: "Verifikasi GPS", desc: "Absensi hanya valid di area sekolah" },
                { icon: "📸", title: "Foto Selfie", desc: "Bukti visual kehadiran guru" },
                { icon: "📊", title: "Laporan Lengkap", desc: "Rekap kehadiran harian & bulanan" },
              ].map((f) => (
                <div key={f.title} className="flex items-center gap-3 bg-white/8 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                  <span className="text-2xl">{f.icon}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">{f.title}</p>
                    <p className="text-white/60 text-xs">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-white/50 text-xs relative z-10">
            © {new Date().getFullYear()} MTS Math'laul Anwar Napal. Hak cipta dilindungi.
          </p>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <img src="/logo.svg" alt="Logo MTS" className="size-16 mb-3 drop-shadow" />
            <h1 className="text-xl font-extrabold text-foreground">MTS Math'laul Anwar Napal</h1>
            <p className="text-sm text-muted-foreground">Sistem Absensi Guru</p>
          </div>

          {/* Card */}
          <div className="card-surface p-7 sm:p-8 animate-fade-up">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <LogIn className="size-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Masuk ke Akun
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Masukkan username dan password Anda
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {/* Username field */}
              <div className="form-group space-y-1.5">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  Username
                </label>
                <div className="relative input-modern rounded-xl">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <User className="size-4" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full bg-transparent pl-10 pr-4 py-3 text-sm rounded-xl outline-none text-foreground placeholder:text-muted-foreground/60"
                    required
                    maxLength={50}
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="form-group space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Kata Sandi
                </label>
                <div className="relative input-modern rounded-xl">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="size-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent pl-10 pr-11 py-3 text-sm rounded-xl outline-none text-foreground placeholder:text-muted-foreground/60"
                    required
                    maxLength={72}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={proses}
                className="form-group w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:bg-primary/90 active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md mt-2"
                style={{ animationDelay: "200ms" }}
              >
                {proses ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LogIn className="size-4" />
                )}
                {proses ? "Memproses..." : "Masuk"}
              </button>
            </form>

            {/* Info box */}
            <div className="mt-5 rounded-xl bg-muted/60 p-3 border border-border">
              <p className="text-center text-xs text-muted-foreground">
                Akun default:{" "}
                <strong className="text-foreground">Admin</strong> /{" "}
                <strong className="text-foreground">Admin1234</strong>
              </p>
              <p className="text-center text-xs text-muted-foreground/70 mt-0.5">
                Segera ubah kata sandi setelah masuk pertama kali
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} MTS Math'laul Anwar Napal
          </p>
        </div>
      </div>
    </div>
  );
}
