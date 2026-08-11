import { createServerFn } from "@tanstack/react-start";
import { authService } from "@/services/auth.service";
import { attendanceService } from "@/services/attendance.service";
import { teacherService } from "@/services/teacher.service";
import { leaveService } from "@/services/leave.service";
import { announcementService } from "@/services/announcement.service";
import { settingsService } from "@/services/settings.service";
import { logService } from "@/services/log.service";
import { storageService } from "@/server/services/storage.service";

export const loginServerFn = createServerFn({ method: "POST" })
  .validator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    return authService.login(data.username, data.password);
  });

export const validateSessionServerFn = createServerFn({ method: "POST" })
  .validator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    return authService.validateSession(data.token);
  });

export const logoutServerFn = createServerFn({ method: "POST" })
  .validator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    return authService.logout(data.token);
  });

export const getTodayAttendanceServerFn = createServerFn({ method: "GET" })
  .validator((data: { teacherId: string; tanggal: string }) => data)
  .handler(async ({ data }) => {
    return attendanceService.getTodayAttendance(data.teacherId, data.tanggal);
  });

export const recordAttendanceServerFn = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    return attendanceService.recordAttendance(data);
  });

export const getSchoolSettingsServerFn = createServerFn({ method: "GET" })
  .handler(async () => {
    return settingsService.getSchoolSettings();
  });

export const updateSchoolSettingsServerFn = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    return settingsService.updateSchoolSettings(data);
  });

export const getAllAnnouncementsServerFn = createServerFn({ method: "GET" })
  .handler(async () => {
    return announcementService.getAllAnnouncements();
  });

export const getLatestAnnouncementServerFn = createServerFn({ method: "GET" })
  .handler(async () => {
    return announcementService.getLatestAnnouncement();
  });

export const createAnnouncementServerFn = createServerFn({ method: "POST" })
  .validator((data: { judul: string; isi_pengumuman: string; tanggal?: string }) => data)
  .handler(async ({ data }) => {
    return announcementService.createAnnouncement(data);
  });

export const deleteAnnouncementServerFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return announcementService.deleteAnnouncement(data.id);
  });

export const getAllTeachersServerFn = createServerFn({ method: "GET" })
  .handler(async () => {
    return teacherService.getAllTeachers();
  });

export const createTeacherServerFn = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    return teacherService.createTeacher(data);
  });

export const updateTeacherServerFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; data: any }) => data)
  .handler(async ({ data }) => {
    return teacherService.updateTeacher(data.id, data.data);
  });

export const deleteTeacherServerFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return teacherService.deleteTeacher(data.id);
  });

export const getTeacherLeaveRequestsServerFn = createServerFn({ method: "GET" })
  .validator((data: { teacherId: string }) => data)
  .handler(async ({ data }) => {
    return leaveService.getTeacherLeaveRequests(data.teacherId);
  });

export const getAllLeaveRequestsServerFn = createServerFn({ method: "GET" })
  .handler(async () => {
    return leaveService.getAllLeaveRequests();
  });

export const submitLeaveRequestServerFn = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    return leaveService.submitLeaveRequest(data);
  });

export const updateLeaveStatusServerFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: string; catatan_admin?: string | null }) => data)
  .handler(async ({ data }) => {
    return leaveService.updateLeaveStatus(data.id, data.status, data.catatan_admin);
  });

export const getAllAttendanceServerFn = createServerFn({ method: "GET" })
  .validator((data: { dari?: string; sampai?: string; limit?: number }) => data)
  .handler(async ({ data }) => {
    return attendanceService.getAllAttendance(data.dari, data.sampai, data.limit);
  });

export const getAttendanceHistoryServerFn = createServerFn({ method: "GET" })
  .validator((data: { teacherId: string; dari?: string; sampai?: string }) => data)
  .handler(async ({ data }) => {
    return attendanceService.getAttendanceHistory(data.teacherId, data.dari, data.sampai);
  });

export const getActivityLogsServerFn = createServerFn({ method: "GET" })
  .validator((data: { limit?: number }) => data)
  .handler(async ({ data }) => {
    return logService.getActivityLogs(data.limit);
  });

export const logActivityServerFn = createServerFn({ method: "POST" })
  .validator((data: { user_id?: string | null; aksi: string; keterangan?: string | null }) => data)
  .handler(async ({ data }) => {
    return logService.logActivity(data);
  });

export const uploadFileServerFn = createServerFn({ method: "POST" })
  .validator((data: { base64Data: string; fileName: string; mimeType?: string }) => data)
  .handler(async ({ data }) => {
    const buffer = Buffer.from(data.base64Data, "base64");
    return storageService.uploadFile(buffer, data.fileName, data.mimeType);
  });

export const getProfileServerFn = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return authService.getProfile(data.id);
  });

export const updateProfileServerFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; data: any }) => data)
  .handler(async ({ data }) => {
    return authService.updateProfile(data.id, data.data);
  });

