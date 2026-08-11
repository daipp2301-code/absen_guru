import { prisma } from "@/database/client";

export const attendanceRepository = {
  async findTodayByTeacher(teacherId: string, tanggal: string) {
    return prisma.attendance.findFirst({
      where: {
        teacher_id: teacherId,
        tanggal,
      },
    });
  },

  async findByTeacherAndDateRange(teacherId: string, dari?: string, sampai?: string) {
    const whereClause: any = { teacher_id: teacherId };
    if (dari || sampai) {
      whereClause.tanggal = {};
      if (dari) whereClause.tanggal.gte = dari;
      if (sampai) whereClause.tanggal.lte = sampai;
    }
    return prisma.attendance.findMany({
      where: whereClause,
      orderBy: { tanggal: "desc" },
    });
  },

  async findAllWithTeacher(dari?: string, sampai?: string, limit = 1000) {
    const whereClause: any = {};
    if (dari || sampai) {
      whereClause.tanggal = {};
      if (dari) whereClause.tanggal.gte = dari;
      if (sampai) whereClause.tanggal.lte = sampai;
    }
    return prisma.attendance.findMany({
      where: whereClause,
      include: {
        teachers: {
          select: {
            nama_lengkap: true,
            nip: true,
          },
        },
      },
      orderBy: { tanggal: "desc" },
      take: limit,
    });
  },

  async upsertAttendance(data: {
    id?: string;
    teacher_id: string;
    tanggal: string;
    jam_masuk?: string | null;
    jam_keluar?: string | null;
    status: string;
    jarak?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    foto_masuk?: string | null;
    foto_keluar?: string | null;
    catatan?: string | null;
  }) {
    const existing = await prisma.attendance.findFirst({
      where: {
        teacher_id: data.teacher_id,
        tanggal: data.tanggal,
      },
    });

    if (existing) {
      return prisma.attendance.update({
        where: { id: existing.id },
        data: {
          ...(data.jam_masuk !== undefined && { jam_masuk: data.jam_masuk }),
          ...(data.jam_keluar !== undefined && { jam_keluar: data.jam_keluar }),
          status: data.status,
          ...(data.jarak !== undefined && { jarak: data.jarak }),
          ...(data.latitude !== undefined && { latitude: data.latitude }),
          ...(data.longitude !== undefined && { longitude: data.longitude }),
          ...(data.foto_masuk !== undefined && { foto_masuk: data.foto_masuk }),
          ...(data.foto_keluar !== undefined && { foto_keluar: data.foto_keluar }),
          ...(data.catatan !== undefined && { catatan: data.catatan }),
        },
      });
    }

    return prisma.attendance.create({
      data: {
        ...(data.id ? { id: data.id } : {}),
        teacher_id: data.teacher_id,
        tanggal: data.tanggal,
        jam_masuk: data.jam_masuk ?? null,
        jam_keluar: data.jam_keluar ?? null,
        status: data.status,
        jarak: data.jarak ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        foto_masuk: data.foto_masuk ?? null,
        foto_keluar: data.foto_keluar ?? null,
        catatan: data.catatan ?? null,
      },
    });
  },
};
