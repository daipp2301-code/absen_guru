import { attendanceRepository } from "@/repositories/attendance.repository";

export const attendanceService = {
  async getTodayAttendance(teacherId: string, tanggal: string) {
    return attendanceRepository.findTodayByTeacher(teacherId, tanggal);
  },

  async getAttendanceHistory(teacherId: string, dari?: string, sampai?: string) {
    return attendanceRepository.findByTeacherAndDateRange(teacherId, dari, sampai);
  },

  async getAllAttendance(dari?: string, sampai?: string, limit = 1000) {
    return attendanceRepository.findAllWithTeacher(dari, sampai, limit);
  },

  async recordAttendance(data: {
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
    return attendanceRepository.upsertAttendance(data);
  },
};
