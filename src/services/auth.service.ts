import { userRepository } from "@/repositories/user.repository";
import { teacherRepository } from "@/repositories/teacher.repository";
import bcrypt from "bcryptjs";
import { prisma } from "@/database/client";

export const authService = {
  async login(username: string, password: string) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new Error("Username atau password salah");
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      throw new Error("Username atau password salah");
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 hari

    const session = await prisma.session.create({
      data: {
        user_id: user.id,
        token,
        expires_at: expiresAt,
      },
    });

    const role = user.user_roles[0]?.role ?? null;
    const teacher = user.teachers[0] ?? null;

    return {
      session: {
        access_token: session.token,
        refresh_token: "",
        token_type: "bearer" as const,
        expires_in: 7 * 24 * 60 * 60,
        user: {
          id: user.id,
          email: user.email ?? "",
          app_metadata: {},
          user_metadata: {
            username: user.username,
            nama_lengkap: user.nama_lengkap,
          },
          aud: "authenticated",
          created_at: user.created_at.toISOString(),
        },
      },
      profil: {
        id: user.id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        email: user.email,
        nomor_telepon: user.nomor_telepon,
        alamat: user.alamat,
        foto_profil: user.foto_profil,
      },
      peran: role as "admin" | "guru" | null,
      guru: teacher ? { id: teacher.id, user_id: teacher.user_id, nama_lengkap: teacher.nama_lengkap } : null,
    };
  },

  async validateSession(token: string) {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        profile: {
          include: {
            user_roles: true,
            teachers: true,
          },
        },
      },
    });

    if (!session || session.expires_at < new Date()) {
      return null;
    }

    const user = session.profile;
    const role = user.user_roles[0]?.role ?? null;
    const teacher = user.teachers[0] ?? null;

    return {
      session: {
        access_token: session.token,
        refresh_token: "",
        token_type: "bearer" as const,
        expires_in: Math.floor((session.expires_at.getTime() - Date.now()) / 1000),
        user: {
          id: user.id,
          email: user.email ?? "",
          app_metadata: {},
          user_metadata: {
            username: user.username,
            nama_lengkap: user.nama_lengkap,
          },
          aud: "authenticated",
          created_at: user.created_at.toISOString(),
        },
      },
      profil: {
        id: user.id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        email: user.email,
        nomor_telepon: user.nomor_telepon,
        alamat: user.alamat,
        foto_profil: user.foto_profil,
      },
      peran: role as "admin" | "guru" | null,
      guru: teacher ? { id: teacher.id, user_id: teacher.user_id, nama_lengkap: teacher.nama_lengkap } : null,
    };
  },

  async logout(token: string) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {});
  },

  async getProfile(userId: string) {
    const profile = await userRepository.findById(userId);
    if (!profile) return null;
    return {
      id: profile.id,
      username: profile.username,
      nama_lengkap: profile.nama_lengkap,
      email: profile.email,
      nomor_telepon: profile.nomor_telepon,
      alamat: profile.alamat,
      foto_profil: profile.foto_profil,
      role: profile.user_roles[0]?.role ?? null,
      teacher: profile.teachers[0] ?? null,
    };
  },

  async updateProfile(userId: string, data: any) {
    const updated = await userRepository.updateProfile(userId, data);
    if (data.foto_profil !== undefined) {
      await teacherRepository.updateByUserId(userId, { foto_profil: data.foto_profil });
    }
    return updated;
  },
};
