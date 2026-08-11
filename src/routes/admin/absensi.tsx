import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, FileSpreadsheet } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { formatJam, formatTanggal } from "@/lib/geo";
import { eksporExcel, eksporPdf } from "@/lib/export";

export const Route = createFileRoute("/admin/absensi")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Riwayat Absensi Guru | Absensi Guru MTS Math'laul Anwar Napal" },
      {
        name: "description",
        content:
          "Pantau seluruh riwayat kehadiran guru, saring berdasarkan tanggal dan nama, lalu ekspor ke PDF atau Excel.",
      },
      { property: "og:title", content: "Riwayat Absensi Guru" },
      { property: "og:description", content: "Rekap kehadiran seluruh guru dengan ekspor laporan." },
    ],
  }),
  component: AdminAbsensi,
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
  teachers: { nama_lengkap: string; nip: string | null } | null;
};

function AdminAbsensi() {
  const [data, setData] = useState<Baris[]>([]);
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");
  const [cari, setCari] = useState("");

  useEffect(() => {
    void (async () => {
      let q = supabase
        .from("attendance")
        .select("*, teachers(nama_lengkap, nip)")
        .order("tanggal", { ascending: false })
        .limit(1000);
      if (dari) q = q.gte("tanggal", dari);
      if (sampai) q = q.lte("tanggal", sampai);
      const { data: rows } = await q;
      setData((rows as unknown as Baris[]) ?? []);
    })();
  }, [dari, sampai]);

  const terfilter = useMemo(
    () =>
      data.filter((r) =>
        (r.teachers?.nama_lengkap ?? "").toLowerCase().includes(cari.toLowerCase()),
      ),
    [data, cari],
  );

  const barisEkspor = terfilter.map((r) => ({
    Nama: r.teachers?.nama_lengkap ?? "-",
    NIP: r.teachers?.nip ?? "-",
    Tanggal: formatTanggal(r.tanggal),
    "Jam Masuk": formatJam(r.jam_masuk),
    "Jam Pulang": formatJam(r.jam_keluar),
    Status: r.status,
    "Jarak (m)": r.jarak ?? "-",
  }));

  return (
    <AppLayout judul="Riwayat Absensi Guru">
      <div className="card-surface space-y-4 p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="dari">Dari</Label>
            <Input id="dari" type="date" value={dari} onChange={(e) => setDari(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sampai">Sampai</Label>
            <Input
              id="sampai"
              type="date"
              value={sampai}
              onChange={(e) => setSampai(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cari">Nama guru</Label>
            <Input
              id="cari"
              placeholder="Cari nama"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
            />
          </div>
          <div className="ml-auto flex gap-2">
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => eksporExcel("rekap-absensi-guru", barisEkspor)}
            >
              <FileSpreadsheet className="size-4" /> Excel
            </Button>
            <Button
              className="gap-2"
              onClick={() =>
                void eksporPdf(
                  "Rekap Absensi Guru",
                  ["Nama", "NIP", "Tanggal", "Jam Masuk", "Jam Pulang", "Status", "Jarak (m)"],
                  barisEkspor.map((b) => Object.values(b)),
                )
              }
            >
              <Download className="size-4" /> PDF
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Masuk</TableHead>
                <TableHead>Pulang</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Jarak</TableHead>
                <TableHead>Foto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {terfilter.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                    Tidak ada data absensi pada rentang ini.
                  </TableCell>
                </TableRow>
              )}
              {terfilter.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.teachers?.nama_lengkap ?? "-"}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatTanggal(r.tanggal)}</TableCell>
                  <TableCell>{formatJam(r.jam_masuk)}</TableCell>
                  <TableCell>{formatJam(r.jam_keluar)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={r.status === "terlambat" ? "destructive" : "default"}
                      className="capitalize"
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.jarak !== null ? `${r.jarak} m` : "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <FotoTersimpan path={r.foto_masuk} alt="Foto absen masuk" />
                      <FotoTersimpan path={r.foto_keluar} alt="Foto absen pulang" />
                    </div>
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
