import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FotoTersimpan } from "@/components/FotoTersimpan";
import { supabase } from "@/integrations/supabase/client";
import { formatTanggal } from "@/lib/geo";

export const Route = createFileRoute("/admin/izin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Persetujuan Izin & Cuti | Absensi Guru MTS Math'laul Anwar Napal" },
      {
        name: "description",
        content: "Tinjau, setujui, atau tolak pengajuan izin, sakit, dinas luar, dan cuti guru.",
      },
      { property: "og:title", content: "Persetujuan Izin & Cuti" },
      { property: "og:description", content: "Kelola persetujuan pengajuan izin guru." },
    ],
  }),
  component: AdminIzin,
});

type Pengajuan = {
  id: string;
  kategori: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  alasan: string;
  dokumen: string | null;
  status: string;
  teachers: { nama_lengkap: string } | null;
};

function AdminIzin() {
  const [daftar, setDaftar] = useState<Pengajuan[]>([]);

  const muat = useCallback(async () => {
    const { data } = await supabase
      .from("leave_requests")
      .select("*, teachers(nama_lengkap)")
      .order("created_at", { ascending: false });
    setDaftar((data as unknown as Pengajuan[]) ?? []);
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  const ubahStatus = async (id: string, status: "disetujui" | "ditolak") => {
    const { error } = await supabase.from("leave_requests").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Pengajuan ${status}`);
    await muat();
  };

  return (
    <AppLayout judul="Persetujuan Izin & Cuti">
      <div className="card-surface p-5">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guru</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Alasan</TableHead>
                <TableHead>Dokumen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {daftar.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                    Belum ada pengajuan izin.
                  </TableCell>
                </TableRow>
              )}
              {daftar.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.teachers?.nama_lengkap ?? "-"}</TableCell>
                  <TableCell>{p.kategori}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {formatTanggal(p.tanggal_mulai)} – {formatTanggal(p.tanggal_selesai)}
                  </TableCell>
                  <TableCell className="max-w-[220px] text-sm">{p.alasan}</TableCell>
                  <TableCell>
                    <FotoTersimpan path={p.dokumen} alt="Dokumen pendukung" />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.status === "disetujui"
                          ? "default"
                          : p.status === "ditolak"
                            ? "destructive"
                            : "secondary"
                      }
                      className="capitalize"
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {p.status === "menunggu" ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={() => void ubahStatus(p.id, "disetujui")}
                        >
                          <Check className="size-4" /> Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                          onClick={() => void ubahStatus(p.id, "ditolak")}
                        >
                          <X className="size-4" /> Tolak
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Selesai</span>
                    )}
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
