import { supabase } from "@/integrations/supabase/client";

const BUCKET = "absensi";

export async function unggahFoto(file: Blob, folder: string, ext = "jpg") {
  const nama = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(nama, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return nama;
}

const cache = new Map<string, string>();

export async function urlFoto(path?: string | null): Promise<string | null> {
  if (!path) return null;
  if (cache.has(path)) return cache.get(path)!;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (!data?.signedUrl) return null;
  cache.set(path, data.signedUrl);
  return data.signedUrl;
}
