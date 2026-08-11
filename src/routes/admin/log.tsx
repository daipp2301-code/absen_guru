import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/log")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Log Aktivitas | Absensi Guru MTS Math'laul Anwar Napal" },
      {
        name: "description",
        content: "Jejak audit aktivitas pengguna: absensi, pengajuan izin, dan perubahan data sistem.",
      },
      { property: "og:title", content: "Log Aktivitas" },
      { property: "og:description", content: "Audit trail aktivitas pengguna sistem absensi." },
    ],
  }),
  component: LogAktivitas,
});

type Log = {
  id: string;
  aksi: string;
  keterangan: string | null;
  created_at: string;
  profiles: { nama_lengkap: string | null } | null;
};

function LogAktivitas() {
  const [daftar, setDaftar] = useState<Log[]>([]);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("activity_logs")
        .select("id,aksi,keterangan,created_at,profiles(nama_lengkap)")
        .order("created_at", { ascending: false })
        .limit(300);
      setDaftar((data as unknown as Log[]) ?? []);
    })();
  }, []);

  return (
    <AppLayout judul="Log Aktivitas">
      <div className="card-surface p-5">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Pengguna</TableHead>
                <TableHead>Aksi</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {daftar.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    Belum ada aktivitas tercatat.
                  </TableCell>
                </TableRow>
              )}
              {daftar.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {new Date(l.created_at).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>{l.profiles?.nama_lengkap ?? "-"}</TableCell>
                  <TableCell className="font-medium">{l.aksi}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {l.keterangan ?? "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
