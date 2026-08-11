import { Suspense, lazy, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Crosshair, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ambilLokasi } from "@/lib/geo";

const MapView = lazy(() => import("@/components/MapView"));

export const Route = createFileRoute("/admin/pengaturan")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Pengaturan Sekolah | Absensi Guru MTS Math'laul Anwar Napal" },
      {
        name: "description",
        content: "Atur titik koordinat sekolah, radius absensi, serta jam masuk dan jam pulang guru.",
      },
      { property: "og:title", content: "Pengaturan Sekolah" },
      { property: "og:description", content: "Konfigurasi lokasi, radius, dan jam kerja sekolah." },
    ],
  }),
  component: Pengaturan,
});

type Sekolah = {
  id: string;
  nama_sekolah: string;
  alamat: string | null;
  latitude: number;
  longitude: number;
  radius: number;
  jam_masuk: string;
  jam_pulang: string;
};

function Pengaturan() {
  const [data, setData] = useState<Sekolah | null>(null);
  const [proses, setProses] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data: row } = await supabase.from("school_settings").select("*").limit(1).maybeSingle();
      setData((row as Sekolah) ?? null);
    })();
  }, []);

  const ubah = (patch: Partial<Sekolah>) => setData((d) => (d ? { ...d, ...patch } : d));

  const gunakanLokasiSaya = async () => {
    try {
      const pos = await ambilLokasi();
      ubah({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      toast.success("Koordinat diisi dari lokasi Anda saat ini");
    } catch {
      toast.error("Gagal membaca lokasi perangkat");
    }
  };

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setProses(true);
    const { error } = await supabase
      .from("school_settings")
      .update({
        nama_sekolah: data.nama_sekolah,
        alamat: data.alamat,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius,
        jam_masuk: data.jam_masuk,
        jam_pulang: data.jam_pulang,
      })
      .eq("id", data.id);
    setProses(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Pengaturan sekolah tersimpan");
  };

  if (!data) {
    return (
      <AppLayout judul="Pengaturan Sekolah">
        <div className="card-surface p-6 text-sm text-muted-foreground">Memuat pengaturan…</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout judul="Pengaturan Sekolah">
      <div className="grid gap-5 lg:grid-cols-2">
        <form onSubmit={simpan} className="card-surface space-y-4 p-5">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama sekolah</Label>
            <Input
              id="nama"
              maxLength={120}
              value={data.nama_sekolah}
              onChange={(e) => ubah({ nama_sekolah: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat sekolah</Label>
            <Input
              id="alamat"
              maxLength={255}
              value={data.alamat ?? ""}
              onChange={(e) => ubah({ alamat: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="0.000001"
                value={data.latitude}
                onChange={(e) => ubah({ latitude: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="0.000001"
                value={data.longitude}
                onChange={(e) => ubah({ longitude: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="radius">Radius absensi (meter)</Label>
              <Input
                id="radius"
                type="number"
                min={20}
                max={5000}
                value={data.radius}
                onChange={(e) => ubah({ radius: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="masuk">Jam masuk</Label>
              <Input
                id="masuk"
                type="time"
                value={data.jam_masuk?.slice(0, 5) ?? ""}
                onChange={(e) => ubah({ jam_masuk: `${e.target.value}:00` })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pulang">Jam pulang</Label>
              <Input
                id="pulang"
                type="time"
                value={data.jam_pulang?.slice(0, 5) ?? ""}
                onChange={(e) => ubah({ jam_pulang: `${e.target.value}:00` })}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={proses} className="gap-2">
              {proses ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Simpan Pengaturan
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={() => void gunakanLokasiSaya()}>
              <Crosshair className="size-4" /> Gunakan Lokasi Saya
            </Button>
          </div>
        </form>

        <div className="card-surface p-5">
          <h3 className="mb-3 text-sm font-semibold">Pratinjau Radius</h3>
          <Suspense fallback={<div className="h-80 w-full animate-pulse rounded-xl bg-muted" />}>
            <MapView
              lat={data.latitude}
              lng={data.longitude}
              radius={data.radius}
              posisiSaya={null}
              className="h-80 w-full rounded-xl"
            />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  );
}
