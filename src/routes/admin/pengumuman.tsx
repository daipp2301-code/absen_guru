import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { formatTanggal } from "@/lib/geo";

export const Route = createFileRoute("/admin/pengumuman")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Pengumuman Sekolah | Absensi Guru MTS Math'laul Anwar Napal" },
      {
        name: "description",
        content: "Buat dan kelola pengumuman sekolah yang tampil di dashboard seluruh guru.",
      },
      { property: "og:title", content: "Pengumuman Sekolah" },
      { property: "og:description", content: "Kelola pengumuman untuk seluruh guru." },
    ],
  }),
  component: Pengumuman,
});

type Item = { id: string; judul: string; isi_pengumuman: string; created_at: string };

function Pengumuman() {
  const [daftar, setDaftar] = useState<Item[]>([]);
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");

  const muat = useCallback(async () => {
    const { data } = await supabase
      .from("announcements")
      .select("id,judul,isi_pengumuman,created_at")
      .order("created_at", { ascending: false });
    setDaftar((data as Item[]) ?? []);
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  const tambah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (judul.trim().length < 3 || isi.trim().length < 3) {
      toast.error("Judul dan isi pengumuman wajib diisi");
      return;
    }
    const { error } = await supabase.from("announcements").insert({
      judul: judul.trim(),
      isi_pengumuman: isi.trim(),
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Pengumuman diterbitkan");
    setJudul("");
    setIsi("");
    await muat();
  };

  const hapus = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await muat();
  };

  return (
    <AppLayout judul="Pengumuman Sekolah">
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <form onSubmit={tambah} className="card-surface space-y-4 p-5">
          <h3 className="text-sm font-semibold">Pengumuman Baru</h3>
          <div className="space-y-2">
            <Label htmlFor="judul">Judul</Label>
            <Input
              id="judul"
              maxLength={120}
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="isi">Isi</Label>
            <Textarea
              id="isi"
              rows={6}
              maxLength={1000}
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full gap-2">
            <Plus className="size-4" /> Terbitkan
          </Button>
        </form>

        <div className="space-y-3">
          {daftar.length === 0 && (
            <div className="card-surface p-6 text-sm text-muted-foreground">
              Belum ada pengumuman.
            </div>
          )}
          {daftar.map((p) => (
            <article key={p.id} className="card-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold">{p.judul}</h4>
                  <p className="text-xs text-muted-foreground">{formatTanggal(p.created_at)}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Hapus pengumuman"
                  onClick={() => void hapus(p.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{p.isi_pengumuman}</p>
            </article>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
