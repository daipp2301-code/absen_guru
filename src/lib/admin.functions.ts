import { createServerFn } from "@tanstack/react-start";
import { requireAppAuth } from "@/middleware/auth";
import {
  buatGuru,
  hapusGuru,
  pastikanAdminAwal,
  ubahKredensial,
  type DataGuru,
} from "./admin.server";

export const seedAdmin = createServerFn({ method: "POST" }).handler(async () => {
  return pastikanAdminAwal();
});

export const tambahGuru = createServerFn({ method: "POST" })
  .middleware([requireAppAuth])
  .validator((data: DataGuru) => data)
  .handler(async ({ data, context }) => buatGuru(context.userId, data));

export const hapusAkunGuru = createServerFn({ method: "POST" })
  .middleware([requireAppAuth])
  .validator((data: { userId: string }) => data)
  .handler(async ({ data, context }) => hapusGuru(context.userId, data.userId));

export const perbaruiKredensial = createServerFn({ method: "POST" })
  .middleware([requireAppAuth])
  .validator((data: { userId: string; username?: string; password?: string }) => data)
  .handler(async ({ data, context }) => ubahKredensial(context.userId, data));
