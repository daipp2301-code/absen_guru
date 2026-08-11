import { prisma } from "@/database/client";

export const logRepository = {
  async create(data: { user_id?: string | null; aksi: string; keterangan?: string | null }) {
    return prisma.activityLog.create({
      data: {
        user_id: data.user_id ?? null,
        aksi: data.aksi,
        keterangan: data.keterangan ?? null,
      },
    });
  },

  async findAll(limit = 100) {
    return prisma.activityLog.findMany({
      include: {
        profile: {
          select: {
            nama_lengkap: true,
            username: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: limit,
    });
  },
};
