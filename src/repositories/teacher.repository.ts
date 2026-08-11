import { prisma } from "@/database/client";

export const teacherRepository = {
  async findAll() {
    return prisma.teacher.findMany({
      orderBy: { nama_lengkap: "asc" },
    });
  },

  async findByUserId(userId: string) {
    return prisma.teacher.findFirst({
      where: { user_id: userId },
    });
  },

  async findById(id: string) {
    return prisma.teacher.findUnique({
      where: { id },
    });
  },

  async create(data: {
    user_id: string;
    nama_lengkap: string;
    nip?: string | null;
    email?: string | null;
    nomor_telepon?: string | null;
    alamat?: string | null;
    foto_profil?: string | null;
    jabatan?: string | null;
    mata_pelajaran?: string | null;
    tempat_lahir?: string | null;
    tanggal_lahir?: string | null;
    jenis_kelamin?: string | null;
    pendidikan_terakhir?: string | null;
    status_kepegawaian?: string | null;
    tanggal_masuk?: string | null;
  }) {
    return prisma.teacher.create({
      data,
    });
  },

  async update(id: string, data: Partial<{
    nama_lengkap: string;
    nip: string | null;
    email: string | null;
    nomor_telepon: string | null;
    alamat: string | null;
    foto_profil: string | null;
    jabatan: string | null;
    mata_pelajaran: string | null;
    tempat_lahir: string | null;
    tanggal_lahir: string | null;
    jenis_kelamin: string | null;
    pendidikan_terakhir: string | null;
    status_kepegawaian: string | null;
    tanggal_masuk: string | null;
  }>) {
    return prisma.teacher.update({
      where: { id },
      data,
    });
  },

  async updateByUserId(userId: string, data: Partial<{
    nama_lengkap: string;
    email: string | null;
    nomor_telepon: string | null;
    alamat: string | null;
    foto_profil: string | null;
  }>) {
    const teacher = await prisma.teacher.findFirst({ where: { user_id: userId } });
    if (!teacher) return null;
    return prisma.teacher.update({
      where: { id: teacher.id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.teacher.delete({
      where: { id },
    });
  },
};
