import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileText,
  Settings,
  Megaphone,
  UserCircle,
  History,
  MapPin,
  LogOut,
  Moon,
  Sun,
  ScrollText,
  Bell,
  ChevronRight,
  Home,
  X,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Item = { label: string; to: string; icon: typeof Users; mobileLabel?: string };

const menuAdmin: Item[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Data Guru", to: "/admin/guru", icon: Users },
  { label: "Riwayat Absensi", to: "/admin/absensi", icon: CalendarCheck },
  { label: "Izin & Cuti", to: "/admin/izin", icon: FileText },
  { label: "Pengumuman", to: "/admin/pengumuman", icon: Megaphone },
  { label: "Log Aktivitas", to: "/admin/log", icon: ScrollText },
  { label: "Pengaturan Sekolah", to: "/admin/pengaturan", icon: Settings },
  { label: "Profil Saya", to: "/profil", icon: UserCircle },
];

const menuGuru: Item[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, mobileLabel: "Beranda" },
  { label: "Absensi", to: "/absensi", icon: MapPin, mobileLabel: "Absensi" },
  { label: "Riwayat Saya", to: "/riwayat", icon: History, mobileLabel: "Riwayat" },
  { label: "Pengajuan Izin", to: "/izin", icon: FileText, mobileLabel: "Izin" },
  { label: "Profil Saya", to: "/profil", icon: UserCircle, mobileLabel: "Profil" },
];

function useTema() {
  const [gelap, setGelap] = useState(false);
  useEffect(() => {
    const tersimpan = localStorage.getItem("tema") === "gelap";
    setGelap(tersimpan);
    document.documentElement.classList.toggle("dark", tersimpan);
  }, []);
  const toggle = () => {
    const next = !gelap;
    setGelap(next);
    localStorage.setItem("tema", next ? "gelap" : "terang");
    document.documentElement.classList.toggle("dark", next);
  };
  return { gelap, toggle };
}

function NavList({
  items,
  onPilih,
  collapse,
}: {
  items: Item[];
  onPilih?: () => void;
  collapse?: boolean;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-0.5 p-3">
      {items.map((item) => {
        const aktif = path === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onPilih}
            className={cn(
              "sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
              aktif
                ? "active bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                aktif
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-transparent text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
              )}
            >
              <item.icon className="size-4" />
            </span>
            {!collapse && (
              <span className="truncate flex-1">{item.label}</span>
            )}
            {!collapse && aktif && (
              <ChevronRight className="size-3.5 opacity-50 shrink-0" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNav({ items }: { items: Item[] }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div
        className="glass-card border-t border-border/60 rounded-none rounded-t-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around px-2 py-1.5">
          {items.map((item) => {
            const aktif = path === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "mobile-nav-item flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl min-w-0",
                  aktif ? "active" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "nav-icon flex size-9 items-center justify-center rounded-xl transition-all duration-200",
                    aktif
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  <item.icon className={cn("size-5 transition-all duration-200", aktif && "scale-105")} />
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium truncate max-w-[48px] text-center leading-tight",
                    aktif ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {item.mobileLabel ?? item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function SidebarHeader({ profil }: { profil: { nama_lengkap?: string; foto_profil?: string | null } | null }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-primary shadow-sm">
        <img src="/logo.svg" alt="Logo MTS" className="size-9 object-contain" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-sidebar-foreground leading-tight">Absensi Guru</p>
        <p className="truncate text-[11px] text-muted-foreground leading-tight">MTS Math'laul Anwar Napal</p>
      </div>
    </div>
  );
}

export function AppLayout({
  children,
  judul,
  hanyaAdmin,
}: {
  children: React.ReactNode;
  judul: string;
  hanyaAdmin?: boolean;
}) {
  const { session, profil, peran, memuat, keluar } = useAuth();
  const navigate = useNavigate();
  const { gelap, toggle } = useTema();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (memuat) return;
    if (!session) void navigate({ to: "/", replace: true });
    else if (hanyaAdmin && peran && peran !== "admin")
      void navigate({ to: "/dashboard", replace: true });
  }, [memuat, session, peran, hanyaAdmin, navigate]);

  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileSidebarOpen]);

  if (memuat || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">Memuat...</p>
        </div>
      </div>
    );
  }

  const items = peran === "admin" ? menuAdmin : menuGuru;
  const inisial = (profil?.nama_lengkap || "?").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-sidebar-border bg-sidebar"
        style={{ boxShadow: "var(--shadow-sidebar)" }}
      >
        <SidebarHeader profil={profil} />

        <div className="flex-1 overflow-y-auto custom-scroll py-2">
          <NavList items={items} />
        </div>

        {/* Sidebar footer */}
        <div className="border-t border-sidebar-border p-3 space-y-1">
          {/* User info */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-sidebar-accent/40 mb-2">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {inisial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate text-sidebar-foreground">{profil?.nama_lengkap || profil?.username}</p>
              <p className="text-[10px] capitalize text-muted-foreground">{peran ?? "-"}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
            onClick={() => void keluar()}
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-destructive/10">
              <LogOut className="size-4" />
            </span>
            <span className="text-sm">Keluar</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar shadow-2xl md:hidden transition-transform duration-300 ease-out",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl overflow-hidden bg-primary">
              <img src="/logo.svg" alt="Logo" className="size-8 object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold text-sidebar-foreground">Absensi Guru</p>
              <p className="text-[11px] text-muted-foreground">MTS Math'laul Anwar Napal</p>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll py-2">
          <NavList items={items} onPilih={() => setMobileSidebarOpen(false)} />
        </div>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-sidebar-accent/40 mb-2">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {inisial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate text-sidebar-foreground">{profil?.nama_lengkap || profil?.username}</p>
              <p className="text-[10px] capitalize text-muted-foreground">{peran ?? "-"}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
            onClick={() => void keluar()}
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-destructive/10">
              <LogOut className="size-4" />
            </span>
            <span className="text-sm">Keluar</span>
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header
          className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur-md"
          style={{ boxShadow: "var(--shadow-header)" }}
        >
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden size-9 rounded-xl"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          {/* Logo - mobile only */}
          <div className="flex md:hidden items-center gap-2">
            <img src="/logo.svg" alt="Logo" className="size-7" />
          </div>

          {/* Page title */}
          <h1 className="hidden md:block min-w-0 flex-1 truncate text-base font-semibold text-foreground">
            {judul}
          </h1>

          {/* Mobile title centered */}
          <h1 className="md:hidden flex-1 text-center text-sm font-semibold text-foreground truncate">
            {judul}
          </h1>

          {/* Header right actions */}
          <div className="flex items-center gap-1.5">
            {/* Notifications bell */}
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-xl relative"
              aria-label="Notifikasi"
            >
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-card" />
            </Button>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-xl"
              onClick={toggle}
              aria-label="Ganti mode tampilan"
            >
              {gelap ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>

            {/* User avatar */}
            <Link to="/profil" className="flex items-center gap-2 pl-1">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold leading-tight">{profil?.nama_lengkap}</p>
                <p className="text-[11px] capitalize text-muted-foreground">{peran ?? "-"}</p>
              </div>
              <Avatar className="size-9 ring-2 ring-primary/20 transition-all hover:ring-primary/50">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {inisial}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 animate-fade-up p-4 sm:p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation - only for guru */}
      {peran === "guru" && <MobileNav items={menuGuru} />}
    </div>
  );
}
