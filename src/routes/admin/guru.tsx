import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { hapusAkunGuru, tambahGuru } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/guru")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Data Guru | Absensi Guru MTS Math'laul Anwar Napal" },
      {
        name: "description",
        content: "Kelola data guru: tambah akun, ubah biodata, dan hapus guru dari sistem absensi sekolah.",
      },
      { property: "og:title", content: "Data Guru" },
      { property: "og:description", content: "Manajemen akun dan biodata guru sekolah." },
    ],
  }),
  component: DataGuru,
});

type Guru = {
  id: string;
  user_id: string | null;
  nip: string | null;
  nama_lengkap: string;
  mata_pelajaran: string | null;
  jabatan: string | null;
  nomor_telepon: string | null;
  email: string | null;
  alamat: string | null;
};

const kosong = {
  nip: "",
  nama_lengkap: "",
  mata_pelajaran: "",
  jabatan: "",
  nomor_telepon: "",
  email: "",
  alamat: "",
  username: "",
  password: "",
};

const skemaBaru = z.object({
  nama_lengkap: z.string().trim().min(3, "Nama minimal 3 karakter").max(100),
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter")
    .max(50)
    .regex(/^[a-zA-Z0-9._-]+$/, "Username hanya boleh huruf, angka, titik, garis bawah, dan strip"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter").max(72),
});

function DataGuru() {
  const [daftar, setDaftar] = useState<Guru[]>([]);
  const [cari, setCari] = useState("");
  const [buka, setBuka] = useState(false);
  const [edit, setEdit] = useState<Guru | null>(null);
  const [form, setForm] = useState(kosong);
  const [proses, setProses] = useState(false);

  const muat = useCallback(async () => {
    const { data } = await supabase.from("teachers").select("*").order("nama_lengkap");
    setDaftar((data as Guru[]) ?? []);
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  const bukaTambah = () => {
    setEdit(null);
    setForm(kosong);
    setBuka(true);
  };

  const bukaEdit = (g: Guru) => {
    setEdit(g);
    setForm({
      ...kosong,
      nip: g.nip ?? "",
      nama_lengkap: g.nama_lengkap,
      mata_pelajaran: g.mata_pelajaran ?? "",
      jabatan: g.jabatan ?? "",
      nomor_telepon: g.nomor_telepon ?? "",
      email: g.email ?? "",
      alamat: g.alamat ?? "",
    });
    setBuka(true);
  };

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setProses(true);
    try {
      if (edit) {
        const { error } = await supabase
          .from("teachers")
          .update({
            nip: form.nip || null,
            nama_lengkap: form.nama_lengkap,
            mata_pelajaran: form.mata_pelajaran || null,
            jabatan: form.jabatan || null,
            nomor_telepon: form.nomor_telepon || null,
            email: form.email || null,
            alamat: form.alamat || null,
          })
          .eq("id", edit.id);
        if (error) throw new Error(error.message);
        toast.success("Data guru diperbarui");
      } else {
        const hasil = skemaBaru.safeParse(form);
        if (!hasil.success) {
          toast.error(hasil.error.issues[0]?.message ?? "Data tidak valid");
          setProses(false);
          return;
        }
        await tambahGuru({
          data: {
            username: form.username,
            password: form.password,
            nama_lengkap: form.nama_lengkap,
            ...(form.nip ? { nip: form.nip } : {}),
            ...(form.mata_pelajaran ? { mata_pelajaran: form.mata_pelajaran } : {}),
            ...(form.jabatan ? { jabatan: form.jabatan } : {}),
            ...(form.nomor_telepon ? { nomor_telepon: form.nomor_telepon } : {}),
            ...(form.email ? { email: form.email } : {}),
            ...(form.alamat ? { alamat: form.alamat } : {}),
          },
        });
        toast.success("Akun guru berhasil dibuat");
      }
      setBuka(false);
      await muat();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan data guru");
    } finally {
      setProses(false);
    }
  };

  const hapus = async (g: Guru) => {
    if (!window.confirm(`Hapus guru ${g.nama_lengkap}? Tindakan ini tidak dapat dibatalkan.`)) return;
    if (!g.user_id) {
      toast.error("Guru ini tidak memiliki akun pengguna terkait.");
      return;
    }
    try {
      await hapusAkunGuru({ data: { userId: g.user_id } });
      toast.success("Guru dihapus");
      await muat();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus guru");
    }
  };

  const terfilter = daftar.filter((g) =>
    `${g.nama_lengkap} ${g.nip ?? ""} ${g.mata_pelajaran ?? ""}`
      .toLowerCase()
      .includes(cari.toLowerCase()),
  );

  return (
    <AppLayout judul="Data Guru">
      <div className="card-surface space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Cari nama, NIP, atau mata pelajaran"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            className="max-w-xs"
          />
          <Button className="ml-auto gap-2" onClick={bukaTambah}>
            <Plus className="size-4" /> Tambah Guru
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>NIP</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {terfilter.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    Belum ada data guru.
                  </TableCell>
                </TableRow>
              )}
              {terfilter.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.nama_lengkap}</TableCell>
                  <TableCell>{g.nip ?? "-"}</TableCell>
                  <TableCell>{g.mata_pelajaran ?? "-"}</TableCell>
                  <TableCell>{g.jabatan ?? "-"}</TableCell>
                  <TableCell>{g.nomor_telepon ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => bukaEdit(g)} aria-label="Ubah">
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => void hapus(g)}
                      aria-label="Hapus"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={buka} onOpenChange={setBuka}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{edit ? "Ubah Data Guru" : "Tambah Guru Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={simpan} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="nama">Nama lengkap</Label>
                <Input
                  id="nama"
                  maxLength={100}
                  value={form.nama_lengkap}
                  onChange={(e) => setForm((f) => ({ ...f, nama_lengkap: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nip">NIP</Label>
                <Input
                  id="nip"
                  maxLength={30}
                  value={form.nip}
                  onChange={(e) => setForm((f) => ({ ...f, nip: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mapel">Mata pelajaran</Label>
                <Input
                  id="mapel"
                  maxLength={100}
                  value={form.mata_pelajaran}
                  onChange={(e) => setForm((f) => ({ ...f, mata_pelajaran: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jabatan">Jabatan</Label>
                <Input
                  id="jabatan"
                  maxLength={100}
                  value={form.jabatan}
                  onChange={(e) => setForm((f) => ({ ...f, jabatan: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telp">Nomor telepon</Label>
                <Input
                  id="telp"
                  maxLength={20}
                  value={form.nomor_telepon}
                  onChange={(e) => setForm((f) => ({ ...f, nomor_telepon: e.target.value }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="mail">Email</Label>
                <Input
                  id="mail"
                  type="email"
                  maxLength={255}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Textarea
                  id="alamat"
                  maxLength={300}
                  value={form.alamat}
                  onChange={(e) => setForm((f) => ({ ...f, alamat: e.target.value }))}
                />
              </div>
              {!edit && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="user">Username</Label>
                    <Input
                      id="user"
                      maxLength={50}
                      value={form.username}
                      onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pass">Kata sandi</Label>
                    <Input
                      id="pass"
                      type="password"
                      maxLength={72}
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={proses} className="gap-2">
                {proses && <Loader2 className="size-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
