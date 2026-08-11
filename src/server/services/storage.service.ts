import fs from "node:fs";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function ensureUploadDir(subfolder?: string) {
  const dir = subfolder ? path.join(UPLOAD_DIR, subfolder) : UPLOAD_DIR;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export const storageService = {
  async uploadFile(fileBuffer: Buffer | ArrayBuffer, fileName: string, mimeType = "image/jpeg"): Promise<string> {
    const parts = fileName.split("/");
    const subfolder = parts.length > 1 ? parts.slice(0, -1).join("/") : "";
    const name = parts[parts.length - 1] ?? fileName;
    const targetDir = ensureUploadDir(subfolder);
    const filePath = path.join(targetDir, name);
    const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
    await fs.promises.writeFile(filePath, buffer);
    return fileName;
  },
  getFileUrl(filePath?: string | null): string | null {
    if (!filePath) return null;
    if (filePath.startsWith("http://") || filePath.startsWith("https://") || filePath.startsWith("data:")) {
      return filePath;
    }
    return `/uploads/${filePath.replace(/^\\+/, "")}`;
  },
};
