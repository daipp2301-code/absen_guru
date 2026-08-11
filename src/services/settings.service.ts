import { settingsRepository } from "@/repositories/settings.repository";

export const settingsService = {
  async getSchoolSettings() {
    return settingsRepository.getSettings();
  },

  async updateSchoolSettings(data: {
    nama_sekolah?: string;
    alamat?: string | null;
    jam_masuk?: string;
    jam_pulang?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    logo?: string | null;
  }) {
    return settingsRepository.updateSettings(data);
  },
};
