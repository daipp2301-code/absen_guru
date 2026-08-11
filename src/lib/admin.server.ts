import { prisma } from "@/database/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";


export function emailDariUsername(username: string) {
  return `${username.trim().toLowerCase()}@absensi.local`;
}

export async function pastikanAdminAwal() {
  const existing = await prisma.userRole.findFirst({ where: { role: "admin" } });
  if (existing) return { dibuat: false };
  const passwordHash = await bcrypt.hash("Admin1234", 10);
  await prisma.profile.create({
    data: {
      username: "Admin",
      password_hash: passwordHash,
      nama_lengkap: "Administrator",
      email: emailDariUsername("Admin"),
      user_roles: { create: { role: "admin" } },
    },
  });
  return { dibuat: true };
}

async function pastikanAdmin(userId: string) {
  const role = await prisma.userRole.findFirst({ where: { user_id: userId, role: "admin" } });
  if (!role) throw new Error("Akses ditolak: hanya administrator");
}

export type DataGuru = {
  username: string;
  password?: string;
  nip?: string;
  nama_lengkap: string;
  jenis_kelamin?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  alamat?: string;
  nomor_telepon?: string;
  email?: string;
  pendidikan_terakhir?: string;
  mata_pelajaran?: string;
  jabatan?: string;
  status_kepegawaian?: string;
  tanggal_masuk?: string;
};

export async function buatGuru(callerId: string, input: DataGuru) {
  await pastikanAdmin(callerId);
  const passwordHash = await bcrypt.hash(input.password || "Guru1234", 10);
  const uid = randomUUID();
  await prisma.profile.create({
    data: {
      id: uid,
      username: input.username,
      password_hash: passwordHash,
      nama_lengkap: input.nama_lengkap,
      email: input.email ?? null,
      nomor_telepon: input.nomor_telepon ?? null,
      alamat: input.alamat ?? null,
      user_roles: { create: { role: "guru" } },
    },
  });
  await prisma.teacher.create({
    data: {
      user_id: uid,
      nip: input.nip ?? null,
      nama_lengkap: input.nama_lengkap,
      jenis_kelamin: input.jenis_kelamin ?? null,
      tempat_lahir: input.tempat_lahir ?? null,
      tanggal_lahir: input.tanggal_lahir || null,
      alamat: input.alamat ?? null,
      nomor_telepon: input.nomor_telepon ?? null,
      email: input.email ?? null,
      pendidikan_terakhir: input.pendidikan_terakhir ?? null,
      mata_pelajaran: input.mata_pelajaran ?? null,
      jabatan: input.jabatan ?? null,
      status_kepegawaian: input.status_kepegawaian ?? null,
      tanggal_masuk: input.tanggal_masuk || null,
    },
  });
  return { ok: true };
}

export async function hapusGuru(callerId: string, userId: string) {
  await pastikanAdmin(callerId);
  await prisma.teacher.deleteMany({ where: { user_id: userId } });
  await prisma.profile.delete({ where: { id: userId } });
  await prisma.session.deleteMany({ where: { user_id: userId } });
  await prisma.userRole.deleteMany({ where: { user_id: userId } });
  return { ok: true };
}

export async function ubahKredensial(
  callerId: string,
  target: { userId: string; username?: string; password?: string }
) {
  if (callerId !== target.userId) await pastikanAdmin(callerId);
  const updates: any = {};
  if (target.username) updates.username = target.username;
  if (target.password) updates.password_hash = await bcrypt.hash(target.password, 10);
  if (Object.keys(updates).length > 0) {
    await prisma.profile.update({ where: { id: target.userId }, data: updates });
  }
  if (target.username) {
    await prisma.profile.update({
      where: { id: target.userId },
      data: { email: emailDariUsername(target.username) },
    });
  }
  return { ok: true };
}
