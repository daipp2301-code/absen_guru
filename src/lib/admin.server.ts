import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Admin = ReturnType<typeof createClient<Database>>;

async function admin(): Promise<Admin> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as Admin;
}

export function emailDariUsername(username: string) {
  return `${username.trim().toLowerCase()}@absensi.local`;
}

export async function pastikanAdminAwal() {
  const db = await admin();
  const { data: adaAdmin } = await db
    .from("user_roles")
    .select("id")
    .eq("role", "admin")
    .limit(1);
  if (adaAdmin && adaAdmin.length > 0) return { dibuat: false };

  const { data: created, error } = await db.auth.admin.createUser({
    email: emailDariUsername("Admin"),
    password: "Admin1234",
    email_confirm: true,
  });
  if (error || !created.user) throw new Error(error?.message ?? "Gagal membuat admin");

  await db.from("profiles").insert({
    id: created.user.id,
    username: "Admin",
    nama_lengkap: "Administrator",
    email: emailDariUsername("Admin"),
  });
  await db.from("user_roles").insert({ user_id: created.user.id, role: "admin" });
  return { dibuat: true };
}

async function pastikanAdmin(userId: string) {
  const db = await admin();
  const { data } = await db
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Akses ditolak: hanya administrator");
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
  const db = await admin();
  const { data: created, error } = await db.auth.admin.createUser({
    email: emailDariUsername(input.username),
    password: input.password || "Guru1234",
    email_confirm: true,
  });
  if (error || !created.user) throw new Error(error?.message ?? "Gagal membuat akun guru");
  const uid = created.user.id;

  const { error: pErr } = await db.from("profiles").insert({
    id: uid,
    username: input.username,
    nama_lengkap: input.nama_lengkap,
    email: input.email ?? null,
    nomor_telepon: input.nomor_telepon ?? null,
    alamat: input.alamat ?? null,
  });
  if (pErr) {
    await db.auth.admin.deleteUser(uid);
    throw new Error(pErr.message);
  }
  await db.from("user_roles").insert({ user_id: uid, role: "guru" });
  const { error: tErr } = await db.from("teachers").insert({
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
  });
  if (tErr) throw new Error(tErr.message);
  return { ok: true };
}

export async function hapusGuru(callerId: string, userId: string) {
  await pastikanAdmin(callerId);
  const db = await admin();
  const { error } = await db.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function ubahKredensial(
  callerId: string,
  target: { userId: string; username?: string; password?: string },
) {
  const db = await admin();
  if (callerId !== target.userId) await pastikanAdmin(callerId);
  const payload: { email?: string; password?: string } = {};
  if (target.username) payload.email = emailDariUsername(target.username);
  if (target.password) payload.password = target.password;
  if (Object.keys(payload).length === 0) return { ok: true };

  const { error } = await db.auth.admin.updateUserById(target.userId, payload);
  if (error) throw new Error(error.message);
  if (target.username) {
    const { error: pErr } = await db
      .from("profiles")
      .update({ username: target.username, email: emailDariUsername(target.username) })
      .eq("id", target.userId);
    if (pErr) throw new Error(pErr.message);
  }
  return { ok: true };
}
