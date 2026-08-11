import { prisma } from "@/database/client";

export const announcementRepository = {
  async findAll() {
    return prisma.announcement.findMany({
      orderBy: { created_at: "desc" },
    });
  },

  async findLatest() {
    return prisma.announcement.findFirst({
      orderBy: { created_at: "desc" },
    });
  },

  async create(data: { judul: string; isi_pengumuman: string; tanggal?: string }) {
    return prisma.announcement.create({
      data: {
        judul: data.judul,
        isi_pengumuman: data.isi_pengumuman,
        tanggal: data.tanggal || new Date().toISOString().slice(0, 10),
      },
    });
  },

  async delete(id: string) {
    return prisma.announcement.delete({
      where: { id },
    });
  },
};
