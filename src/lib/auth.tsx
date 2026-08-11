import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
// Session type removed – using Prisma session
import type { Session } from "@prisma/client"; // Prisma session type
import { supabase } from "@/integrations/supabase/client"; // still used for data queries
import { validateSessionServerFn, loginServerFn, logoutServerFn } from "@/api/serverFunctions";
import { emailDariUsername } from "./username";

export type Profil = {
  id: string;
  username: string;
  nama_lengkap: string;
  email: string | null;
  nomor_telepon: string | null;
  alamat: string | null;
  foto_profil: string | null;
};

export type Guru = { id: string; user_id: string; nama_lengkap: string } | null;

type AuthValue = {
  session: Session | null;
  profil: Profil | null;
  peran: "admin" | "guru" | null;
  guru: Guru;
  memuat: boolean;
  masuk: (username: string, password: string) => Promise<void>;
  keluar: () => Promise<void>;
  muatUlang: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [peran, setPeran] = useState<"admin" | "guru" | null>(null);
  const [guru, setGuru] = useState<Guru>(null);
  const [memuat, setMemuat] = useState(true);

  const muatData = useCallback(async (uid: string | undefined) => {
    if (!uid) {
      setProfil(null);
      setPeran(null);
      setGuru(null);
      return;
    }
    const [p, r, t] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid).maybeSingle(),
      supabase.from("teachers").select("id,user_id,nama_lengkap").eq("user_id", uid).maybeSingle(),
    ]);
    setProfil((p.data as Profil) ?? null);
    setPeran((r.data?.role as "admin" | "guru") ?? null);
    setGuru((t.data as Guru) ?? null);
  }, []);

  // On mount, load session from cookie/localStorage using our Prisma backend
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    if (!token) {
      setMemuat(false);
      return;
    }
    (async () => {
      try {
        const full = await validateSessionServerFn({ data: { token } });
        setProfil(full.profil ?? null);
        setPeran(full.peran ?? null);
        setGuru(full.guru ?? null);
        console.log('[AUTH] Session restored from cookie');
      } catch (e) {
        console.error('[AUTH] Failed to restore session', e);
        setProfil(null);
        setPeran(null);
        setGuru(null);
        // clear invalid token
        localStorage.removeItem('session_token');
      } finally {
        setMemuat(false);
      }
    })();
    // No Supabase auth listener needed
  }, []);

  const masuk = useCallback(async (username: string, password: string) => {
    console.log('[AUTH] MySQL login started');
    try {
      const result = await loginServerFn({ data: { username, password } });
      // result contains session, profil, peran, guru
      const token = result.session.access_token;
      // store token in http-only cookie is set by server, also keep in localStorage for legacy code
      if (typeof window !== 'undefined') {
        localStorage.setItem('session_token', token);
      }
      console.log('[AUTH] Session token stored');
      // update context with returned data
      setProfil(result.profil ?? null);
      setPeran(result.peran ?? null);
      setGuru(result.guru ?? null);
      // set Prisma session instead of null
      setSession(result.session);
      // loading complete after login
      setMemuat(false);
      console.log('[AUTH] MySQL login succeeded');
      console.log('[AUTH] Login successful, user ID:', result.session.userId ?? result.session.id);
      console.log('[AUTH] Role:', result.peran);
      console.log('[AUTH] Redirect will be handled by redirect effect');
      console.log('[AUTH] Redirecting based on role');
    } catch (e: any) {
      console.error('[AUTH] MySQL login error:', e);
      throw new Error(e.message ?? 'Username atau password salah');
    }
  }, []);

  const keluar = useCallback(async () => {
    console.log('[AUTH] logout started');
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    if (token) {
      try {
        await logoutServerFn({ data: { token } });
      } catch (e) {
        console.error('[AUTH] logout error', e);
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('session_token');
    }
    setSession(null);
    setProfil(null);
    setPeran(null);
    setGuru(null);
    console.log('[AUTH] logout completed');
  }, []);

  const muatUlang = useCallback(async () => {
    // Refresh session by re‑validating the token stored in localStorage (or cookie)
    const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : null;
    if (!token) return;
    try {
      const full = await validateSessionServerFn({ data: { token } });
      setProfil(full.profil ?? null);
      setPeran(full.peran ?? null);
      setGuru(full.guru ?? null);
      console.log("[AUTH] Session refreshed from server");
    } catch (e) {
      console.error("[AUTH] Session refresh failed", e);
      localStorage.removeItem("session_token");
      setProfil(null);
      setPeran(null);
      setGuru(null);
    }
  }, [muatData]);

  const value = useMemo(
    () => ({ session, profil, peran, guru, memuat, masuk, keluar, muatUlang }),
    [session, profil, peran, guru, memuat, masuk, keluar, muatUlang],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
