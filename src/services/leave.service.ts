import { leaveRepository } from "@/repositories/leave.repository";

export const leaveService = {
  async getTeacherLeaveRequests(teacherId: string) {
    return leaveRepository.findByTeacher(teacherId);
  },

  async getAllLeaveRequests() {
    return leaveRepository.findAllWithTeacher();
  },

  async submitLeaveRequest(data: {
    teacher_id: string;
    kategori: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    alasan: string;
    dokumen?: string | null;
  }) {
    return leaveRepository.create(data);
  },

  async updateLeaveStatus(id: string, status: string, catatan_admin?: string | null) {
    return leaveRepository.updateStatus(id, status, catatan_admin);
  },
};
