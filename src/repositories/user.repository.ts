import { prisma } from "@/database/client";

export const userRepository = {
  async findByUsername(username: string) {
    return prisma.profile.findUnique({
      where: { username },
      include: {
        user_roles: true,
        teachers: true,
      },
    });
  },

  async findById(id: string) {
    return prisma.profile.findUnique({
      where: { id },
      include: {
        user_roles: true,
        teachers: true,
      },
    });
  },

  async updateProfile(id: string, data: {
    nama_lengkap?: string;
    email?: string | null;
    nomor_telepon?: string | null;
    alamat?: string | null;
    foto_profil?: string | null;
  }) {
    return prisma.profile.update({
      where: { id },
      data,
    });
  },

  async getRole(userId: string) {
    const roleRecord = await prisma.userRole.findFirst({
      where: { user_id: userId },
    });
    return roleRecord?.role ?? null;
  },

  async createProfile(data: {
    id?: string;
    username: string;
    password_hash: string;
    nama_lengkap: string;
    email?: string | null;
    nomor_telepon?: string | null;
    alamat?: string | null;
    foto_profil?: string | null;
    role: "admin" | "guru";
  }) {
    return prisma.profile.create({
      data: {
        ...(data.id ? { id: data.id } : {}),
        username: data.username,
        password_hash: data.password_hash,
        nama_lengkap: data.nama_lengkap,
        email: data.email ?? null,
        nomor_telepon: data.nomor_telepon ?? null,
        alamat: data.alamat ?? null,
        foto_profil: data.foto_profil ?? null,
        user_roles: {
          create: {
            role: data.role,
          },
        },
      },
      include: {
        user_roles: true,
      },
    });
  },
};
