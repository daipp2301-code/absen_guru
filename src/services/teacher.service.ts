import { teacherRepository } from "@/repositories/teacher.repository";
import { userRepository } from "@/repositories/user.repository";
import bcrypt from "bcryptjs";

export const teacherService = {
  async getAllTeachers() {
    return teacherRepository.findAll();
  },

  async getTeacherByUserId(userId: string) {
    return teacherRepository.findByUserId(userId);
  },

  async getTeacherById(id: string) {
    return teacherRepository.findById(id);
  },

  async createTeacher(data: {
    username: string;
    password?: string;
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
    const defaultPassword = data.password || "123456";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const profile = await userRepository.createProfile({
      username: data.username,
      password_hash: passwordHash,
      nama_lengkap: data.nama_lengkap,
      email: data.email ?? null,
      nomor_telepon: data.nomor_telepon ?? null,
      alamat: data.alamat ?? null,
      foto_profil: data.foto_profil ?? null,
      role: "guru",
    });

    return teacherRepository.create({
      user_id: profile.id,
      nama_lengkap: data.nama_lengkap,
      nip: data.nip ?? null,
      email: data.email ?? null,
      nomor_telepon: data.nomor_telepon ?? null,
      alamat: data.alamat ?? null,
      foto_profil: data.foto_profil ?? null,
      jabatan: data.jabatan ?? null,
      mata_pelajaran: data.mata_pelajaran ?? null,
      tempat_lahir: data.tempat_lahir ?? null,
      tanggal_lahir: data.tanggal_lahir ?? null,
      jenis_kelamin: data.jenis_kelamin ?? null,
      pendidikan_terakhir: data.pendidikan_terakhir ?? null,
      status_kepegawaian: data.status_kepegawaian ?? null,
      tanggal_masuk: data.tanggal_masuk ?? null,
    });
  },

  async updateTeacher(id: string, data: any) {
    const updated = await teacherRepository.update(id, data);
    if (updated.user_id) {
      await userRepository.updateProfile(updated.user_id, {
        nama_lengkap: data.nama_lengkap,
        email: data.email,
        nomor_telepon: data.nomor_telepon,
        alamat: data.alamat,
        foto_profil: data.foto_profil,
      });
    }
    return updated;
  },

  async deleteTeacher(id: string) {
    return teacherRepository.delete(id);
  },
};
