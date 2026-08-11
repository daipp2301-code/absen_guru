import { announcementRepository } from "@/repositories/announcement.repository";

export const announcementService = {
  async getAllAnnouncements() {
    return announcementRepository.findAll();
  },

  async getLatestAnnouncement() {
    return announcementRepository.findLatest();
  },

  async createAnnouncement(data: { judul: string; isi_pengumuman: string; tanggal?: string }) {
    return announcementRepository.create(data);
  },

  async deleteAnnouncement(id: string) {
    return announcementRepository.delete(id);
  },
};
