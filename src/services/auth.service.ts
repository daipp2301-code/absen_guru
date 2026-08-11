import { userRepository } from "@/repositories/user.repository";
import { teacherRepository } from "@/repositories/teacher.repository";
import bcrypt from "bcryptjs";
import { prisma } from "@/database/client";
import { randomUUID } from "node:crypto";

export const authService = {
  async login(username: string, password: string) {
    console.log(`[AUTH SERVER] login request received`);
    console.log(`[AUTH SERVER] identifier: ${username}`);
    console.log(`[AUTH SERVER] database connection starting`);
    const user = await userRepository.findByUsername(username);
    console.log(`[AUTH SERVER] user query starting`);
    if (!user) {
      console.log(`[AUTH SERVER] user found: false`);
      throw new Error("Username atau password salah");
    }
    console.log(`[AUTH SERVER] user found: true`);
    console.log(`[AUTH SERVER] password verification starting`);

    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log(`[AUTH DEBUG] password verification: ${validPassword}`);
    if (!validPassword) {
      console.log(`[AUTH DEBUG] user found: true`);
      throw new Error("Username atau password salah");
    }

    console.log(`[AUTH SERVER] token generation`);
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 hari

    console.log(`[AUTH SERVER] creating session in DB`);
    const session = await prisma.session.create({
      data: {
        user_id: user.id,
        token,
        expires_at: expiresAt,
      },
    });
    console.log(`[AUTH SERVER] session created, id: ${session.id}`);

    console.log(`[AUTH SERVER] fetching role and teacher info`);
    const role = user.user_roles[0]?.role ?? null;
    const teacher = user.teachers[0] ?? null;

    console.log(`[AUTH SERVER] authentication success`);
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
