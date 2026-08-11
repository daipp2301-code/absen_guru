import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
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

  useEffect(() => {
    let aktif = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!aktif) return;
      setSession(s);
      if (!s) {
        setProfil(null);
        setPeran(null);
        setGuru(null);
      } else {
        setTimeout(() => void muatData(s.user.id), 0);
      }
    });

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!aktif) return;
      setSession(data.session);
      await muatData(data.session?.user.id);
      setMemuat(false);
    })();

    return () => {
      aktif = false;
      sub.subscription.unsubscribe();
    };
  }, [muatData]);

  const masuk = useCallback(async (username: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: emailDariUsername(username),
      password,
    });
    if (error) throw new Error("Username atau password salah");
  }, []);

  const keluar = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfil(null);
    setPeran(null);
    setGuru(null);
  }, []);

  const muatUlang = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await muatData(data.session?.user.id);
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
