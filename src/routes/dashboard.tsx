import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import {
  CalendarCheck,
  Clock,
  FileText,
  MapPin,
  Megaphone,
  Stethoscope,
  Users,
  TrendingUp,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatJam, formatTanggal, tanggalHariIni } from "@/lib/geo";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard | Absensi Guru MTS Math'laul Anwar Napal" },
      {
        name: "description",
        content: "Ringkasan kehadiran guru harian, grafik kehadiran, dan pengumuman sekolah.",
      },
      { property: "og:title", content: "Dashboard Absensi Guru" },
      { property: "og:description", content: "Ringkasan kehadiran guru dan pengumuman sekolah." },
    ],
  }),
  component: Dashboard,
});

type Statistik = {
  guru: number;
  hadir: number;
  terlambat: number;
  izin: number;
  sakit: number;
};

type StatCardProps = {
  label: string;
  nilai: number;
  icon: typeof Users;
  color: string;
  bgColor: string;
  subtitle?: string;
  trend?: number;
};

function StatCard({ label, nilai, icon: Icon, color, bgColor, subtitle, trend }: StatCardProps) {
  return (
    <div className="stat-card flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div
          className="flex size-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: bgColor }}
        >
          <Icon className="size-5" style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${trend >= 0 ? "text-success" : "text-destructive"}`}>
            <TrendingUp className={`size-3 ${trend < 0 ? "rotate-180" : ""}`} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-foreground leading-none">{nilai}</p>
        <p className="text-xs font-medium text-muted-foreground mt-1">{label}</p>
        {subtitle && (
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function PengumumanCard({
  judul,
  isi,
  tanggal,
  index,
}: {
  judul: string;
  isi: string;
  tanggal: string;
  index: number;
}) {
  const colors = ["bg-primary/10 text-primary", "bg-info/10 text-info", "bg-warning/10 text-warning-foreground", "bg-success/10 text-success"];
  return (
    <div className="flex gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors duration-150 group">
      <div className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${colors[index % 4]}`}>
        <Megaphone className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {judul}
          </p>
          <span className="shrink-0 text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5 whitespace-nowrap">
            {formatTanggal(tanggal)}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{isi}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const { peran, guru, profil } = useAuth();
  const [stat, setStat] = useState<Statistik>({
    guru: 0,
    hadir: 0,
    terlambat: 0,
    izin: 0,
    sakit: 0,
  });
  const [grafik, setGrafik] = useState<Array<{ tanggal: string; hadir: number }>>([]);
  const [pengumuman, setPengumuman] = useState<
    Array<{ id: string; judul: string; isi_pengumuman: string; tanggal: string }>
  >([]);
  const [absenSaya, setAbsenSaya] = useState<{
    jam_masuk: string | null;
    jam_keluar: string | null;
    status: string;
  } | null>(null);
  const [waktuSekarang, setWaktuSekarang] = useState(new Date());

  const hariIni = useMemo(() => tanggalHariIni(), []);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setWaktuSekarang(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    void (async () => {
      const { data: ann } = await supabase
        .from("announcements")
        .select("*")
        .order("tanggal", { ascending: false })
        .limit(4);
      setPengumuman(ann ?? []);

      if (peran === "admin") {
        const { count: jumlahGuru } = await supabase
          .from("teachers")
          .select("id");
        const { data: absenHariIni } = await supabase
          .from("attendance")
          .select("status")
          .eq("tanggal", hariIni);
        const { data: izinAktif } = await supabase
          .from("leave_requests")
          .select("kategori,status,tanggal_mulai,tanggal_selesai")
          .eq("status", "disetujui")
          .lte("tanggal_mulai", hariIni)
          .gte("tanggal_selesai", hariIni);

        setStat({
          guru: jumlahGuru ?? 0,
          hadir: (absenHariIni ?? []).filter((a: any) => a.status === "hadir").length,
          terlambat: (absenHariIni ?? []).filter((a: any) => a.status === "terlambat").length,
          izin: (izinAktif ?? []).filter((i: any) => i.kategori !== "Sakit").length,
          sakit: (izinAktif ?? []).filter((i: any) => i.kategori === "Sakit").length,
        });

        const mulai = new Date(Date.now() - 6 * 86400000).toLocaleDateString("en-CA");
        const { data: riwayat } = await supabase
          .from("attendance")
          .select("tanggal")
          .gte("tanggal", mulai);
        const peta = new Map<string, number>();
        for (let i = 6; i >= 0; i--) {
          const t = new Date(Date.now() - i * 86400000).toLocaleDateString("en-CA");
          peta.set(t, 0);
        }
        (riwayat ?? []).forEach((r: any) => {
          if (peta.has(r.tanggal)) peta.set(r.tanggal, (peta.get(r.tanggal) ?? 0) + 1);
        });
        setGrafik(
          Array.from(peta.entries()).map(([tanggal, hadir]) => ({
            tanggal: formatTanggal(tanggal).slice(0, 6),
            hadir,
          })),
        );
      } else if (guru) {
        const { data } = await supabase
          .from("attendance")
          .select("jam_masuk,jam_keluar,status")
          .eq("teacher_id", guru.id)
          .eq("tanggal", hariIni)
          .maybeSingle();
        setAbsenSaya(data ?? null);

        const mulai = new Date(Date.now() - 29 * 86400000).toLocaleDateString("en-CA");
        const { data: riwayat } = await supabase
          .from("attendance")
          .select("status")
          .eq("teacher_id", guru.id)
          .gte("tanggal", mulai);
        const { data: izinSaya } = await supabase
          .from("leave_requests")
          .select("kategori,status")
          .eq("teacher_id", guru.id)
          .eq("status", "disetujui");
        setStat({
          guru: 0,
          hadir: (riwayat ?? []).filter((r: any) => r.status === "hadir").length,
          terlambat: (riwayat ?? []).filter((r: any) => r.status === "terlambat").length,
          izin: (izinSaya ?? []).filter((i: any) => i.kategori !== "Sakit").length,
          sakit: (izinSaya ?? []).filter((i: any) => i.kategori === "Sakit").length,
        });

        // Chart for guru
        const mulaiGrafik = new Date(Date.now() - 6 * 86400000).toLocaleDateString("en-CA");
        const { data: riwayatGrafik } = await supabase
          .from("attendance")
          .select("tanggal,status")
          .eq("teacher_id", guru.id)
          .gte("tanggal", mulaiGrafik);
        const peta = new Map<string, number>();
        for (let i = 6; i >= 0; i--) {
          const t = new Date(Date.now() - i * 86400000).toLocaleDateString("en-CA");
          peta.set(t, 0);
        }
        (riwayatGrafik ?? []).forEach((r: any) => {
          if (peta.has(r.tanggal)) peta.set(r.tanggal, 1);
        });
        setGrafik(
          Array.from(peta.entries()).map(([tanggal, hadir]) => ({
            tanggal: formatTanggal(tanggal).slice(0, 6),
            hadir,
          })),
        );
      }
    })();
  }, [peran, guru, hariIni]);

  const jamStr = waktuSekarang.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const tanggalStr = waktuSekarang.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const statusAbsen = absenSaya?.jam_masuk
    ? absenSaya.jam_keluar
      ? "Sudah Pulang"
      : "Sudah Masuk"
    : "Belum Absen";

  const statusColor = absenSaya?.jam_masuk
    ? absenSaya.jam_keluar
      ? "text-muted-foreground"
      : "text-success"
    : "text-warning";

  return (
    <AppLayout judul="Dashboard">
      <div className="space-y-5 max-w-7xl mx-auto">

        {/* Welcome Banner */}
        <div className="dashboard-banner rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/70 text-sm font-medium">Selamat datang kembali 👋</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-0.5">
                {profil?.nama_lengkap || profil?.username}
              </h2>
              <p className="text-white/70 text-sm mt-1 capitalize">{peran === "admin" ? "Administrator" : "Guru"}</p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <p className="text-3xl sm:text-4xl font-bold tabular-nums">{jamStr}</p>
              <p className="text-white/70 text-xs mt-1 capitalize">{tanggalStr}</p>
              {peran === "guru" && (
                <div className={`mt-2 flex sm:justify-end items-center gap-1.5 text-xs font-semibold ${statusColor}`}>
                  {absenSaya?.jam_masuk ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : (
                    <AlertCircle className="size-3.5" />
                  )}
                  {statusAbsen}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {peran === "admin" ? (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
            <StatCard
              label="Total Guru"
              nilai={stat.guru}
              icon={Users}
              color="#1e8b4f"
              bgColor="rgba(30,139,79,0.12)"
              subtitle="Terdaftar di sistem"
            />
            <StatCard
              label="Hadir Hari Ini"
              nilai={stat.hadir}
              icon={CalendarCheck}
              color="#16a34a"
              bgColor="rgba(22,163,74,0.12)"
              subtitle="Tepat waktu"
            />
            <StatCard
              label="Terlambat"
              nilai={stat.terlambat}
              icon={Clock}
              color="#d97706"
              bgColor="rgba(217,119,6,0.12)"
              subtitle="Hari ini"
            />
            <StatCard
              label="Izin Aktif"
              nilai={stat.izin}
              icon={FileText}
              color="#2563eb"
              bgColor="rgba(37,99,235,0.12)"
              subtitle="Disetujui"
            />
            <StatCard
              label="Sakit"
              nilai={stat.sakit}
              icon={Stethoscope}
              color="#dc2626"
              bgColor="rgba(220,38,38,0.12)"
              subtitle="Disetujui"
            />
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <StatCard
              label="Hadir"
              nilai={stat.hadir}
              icon={CalendarCheck}
              color="#16a34a"
              bgColor="rgba(22,163,74,0.12)"
              subtitle="30 hari terakhir"
            />
            <StatCard
              label="Terlambat"
              nilai={stat.terlambat}
              icon={Clock}
              color="#d97706"
              bgColor="rgba(217,119,6,0.12)"
              subtitle="30 hari terakhir"
            />
            <StatCard
              label="Izin"
              nilai={stat.izin}
              icon={FileText}
              color="#2563eb"
              bgColor="rgba(37,99,235,0.12)"
              subtitle="Disetujui"
            />
            <StatCard
              label="Sakit"
              nilai={stat.sakit}
              icon={Stethoscope}
              color="#dc2626"
              bgColor="rgba(220,38,38,0.12)"
              subtitle="Disetujui"
            />
          </div>
        )}

        {/* Charts & Info grid */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Chart */}
          <div className="card-surface p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">
                  {peran === "admin" ? "Grafik Kehadiran" : "Aktivitas Absensi"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">7 hari terakhir</p>
              </div>
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
                <Activity className="size-4 text-primary" />
              </div>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={grafik} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grafikGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="tanggal"
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                    cursor={{ stroke: "var(--color-primary)", strokeWidth: 1, strokeDasharray: "4 2" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hadir"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    fill="url(#grafikGrad)"
                    dot={{ fill: "var(--color-primary)", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Hadir"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Absensi today (guru) */}
            {peran === "guru" && (
              <div className="card-surface p-5">
                <h3 className="font-semibold text-foreground mb-3">Absensi Hari Ini</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-muted/60 rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Jam Masuk</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">{formatJam(absenSaya?.jam_masuk)}</p>
                  </div>
                  <div className="bg-muted/60 rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Jam Pulang</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">{formatJam(absenSaya?.jam_keluar)}</p>
                  </div>
                </div>
                {absenSaya && (
                  <div className="mb-4">
                    <Badge
                      variant={absenSaya.status === "terlambat" ? "destructive" : "default"}
                      className="capitalize"
                    >
                      {absenSaya.status}
                    </Badge>
                  </div>
                )}
                <Link
                  to="/absensi"
                  className="flex w-full items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <MapPin className="size-4" />
                  Buka Absensi
                  <ArrowRight className="size-3.5 ml-auto" />
                </Link>
              </div>
            )}

            {/* Quick links - admin */}
            {peran === "admin" && (
              <div className="card-surface p-5">
                <h3 className="font-semibold text-foreground mb-3">Akses Cepat</h3>
                <div className="space-y-2">
                  {[
                    { label: "Data Guru", to: "/admin/guru", icon: Users, color: "text-primary bg-primary/10" },
                    { label: "Riwayat Absensi", to: "/admin/absensi", icon: CalendarCheck, color: "text-success bg-success/10" },
                    { label: "Pengajuan Izin", to: "/admin/izin", icon: FileText, color: "text-info bg-info/10" },
                    { label: "Pengaturan", to: "/admin/pengaturan", icon: Activity, color: "text-warning bg-warning/10" },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors duration-150 group"
                    >
                      <div className={`flex size-8 items-center justify-center rounded-lg ${item.color}`}>
                        <item.icon className="size-4" />
                      </div>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                      <ArrowRight className="size-3.5 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
                <Megaphone className="size-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Pengumuman Terbaru</h3>
                <p className="text-xs text-muted-foreground">{pengumuman.length} pengumuman</p>
              </div>
            </div>
            {peran === "admin" && (
              <Link
                to="/admin/pengumuman"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Kelola <ArrowRight className="size-3" />
              </Link>
            )}
          </div>

          {pengumuman.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
              <Megaphone className="size-8 opacity-30" />
              <p className="text-sm">Belum ada pengumuman.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {pengumuman.map((p, i) => (
                <PengumumanCard
                  key={p.id}
                  judul={p.judul}
                  isi={p.isi_pengumuman}
                  tanggal={p.tanggal}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
