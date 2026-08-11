import { prisma } from "@/database/client";

export const leaveRepository = {
  async findByTeacher(teacherId: string) {
    return prisma.leaveRequest.findMany({
      where: { teacher_id: teacherId },
      orderBy: { created_at: "desc" },
    });
  },

  async findAllWithTeacher() {
    return prisma.leaveRequest.findMany({
      include: {
        teachers: {
          select: {
            nama_lengkap: true,
            nip: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  },

  async create(data: {
    teacher_id: string;
    kategori: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    alasan: string;
    dokumen?: string | null;
  }) {
    return prisma.leaveRequest.create({
      data: {
        ...data,
        status: "menunggu",
      },
    });
  },

  async updateStatus(id: string, status: string, catatan_admin?: string | null) {
    return prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        ...(catatan_admin !== undefined && { catatan_admin }),
      },
    });
  },
};
