import { prisma } from "@/database/client";

export const settingsRepository = {
  async getSettings() {
    const row = await prisma.schoolSettings.findFirst();
    if (!row) {
      return prisma.schoolSettings.create({
        data: {
          id: "default",
          nama_sekolah: "MTS Math'laul Anwar Napal",
          jam_masuk: "07:00",
          jam_pulang: "14:00",
          latitude: -5.3582,
          longitude: 105.1234,
          radius: 100,
        },
      });
    }
    return row;
  },

  async updateSettings(data: {
    nama_sekolah?: string;
    alamat?: string | null;
    jam_masuk?: string;
    jam_pulang?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    logo?: string | null;
  }) {
    const existing = await this.getSettings();
    return prisma.schoolSettings.update({
      where: { id: existing.id },
      data,
    });
  },
};
