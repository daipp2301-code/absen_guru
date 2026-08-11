import { logRepository } from "@/repositories/log.repository";

export const logService = {
  async logActivity(data: { user_id?: string | null; aksi: string; keterangan?: string | null }) {
    return logRepository.create(data);
  },

  async getActivityLogs(limit = 100) {
    return logRepository.findAll(limit);
  },
};
