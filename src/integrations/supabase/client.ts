import {
  loginServerFn,
  validateSessionServerFn,
  logoutServerFn,
  getTodayAttendanceServerFn,
  recordAttendanceServerFn,
  getSchoolSettingsServerFn,
  updateSchoolSettingsServerFn,
  getAllAnnouncementsServerFn,
  getLatestAnnouncementServerFn,
  createAnnouncementServerFn,
  deleteAnnouncementServerFn,
  getAllTeachersServerFn,
  createTeacherServerFn,
  updateTeacherServerFn,
  deleteTeacherServerFn,
  getTeacherLeaveRequestsServerFn,
  getAllLeaveRequestsServerFn,
  submitLeaveRequestServerFn,
  updateLeaveStatusServerFn,
  getAllAttendanceServerFn,
  getAttendanceHistoryServerFn,
  getActivityLogsServerFn,
  logActivityServerFn,
  uploadFileServerFn,
  getProfileServerFn,
  updateProfileServerFn,
} from "@/api/serverFunctions";


type AuthListener = (event: string, session: any) => void;
const listeners = new Set<AuthListener>();

export const supabase = {
  auth: {
    async signInWithPassword({ email, password }: { email?: string; password?: string }) {
      try {
        const username = email ? email.split("@")[0] : "";
        console.log(`[AUTH DEBUG] Supabase signInWithPassword called with username: ${username}`);
      const result = await loginServerFn({ data: { username: username || "", password: password || "" } });
      console.log(`[AUTH DEBUG] Supabase loginServerFn result received`);
        if (typeof window !== "undefined") {
          localStorage.setItem("session_token", result.session.access_token);
        }
        listeners.forEach((cb) => cb("SIGNED_IN", result.session));
        return { data: result, error: null };
      } catch (err: any) {
        return { data: { session: null, user: null }, error: new Error(err.message || "Login gagal") };
      }
    },

    async signOut() {
      const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : null;
      if (token) {
        await logoutServerFn({ data: { token } }).catch(() => {});
        if (typeof window !== "undefined") {
          localStorage.removeItem("session_token");
        }
      }
      listeners.forEach((cb) => cb("SIGNED_OUT", null));
      return { error: null };
    },

    async getSession() {
      const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : null;
      if (!token) {
        return { data: { session: null }, error: null };
      }
      try {
        const result = await validateSessionServerFn({ data: { token } });
        if (!result) {
          if (typeof window !== "undefined") localStorage.removeItem("session_token");
          return { data: { session: null }, error: null };
        }
        return { data: { session: result.session }, error: null };
      } catch {
        return { data: { session: null }, error: null };
      }
    },

    async getUser() {
      const { data } = await this.getSession();
      return { data: { user: data.session?.user ?? null }, error: null };
    },

    onAuthStateChange(callback: AuthListener) {
      listeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              listeners.delete(callback);
            },
          },
        },
      };
    },
  },

  storage: {
    from(bucket: string) {
      return {
        async upload(path: string, file: Blob | File, options?: any) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const base64Data = Buffer.from(arrayBuffer).toString("base64");
            const resultPath = await uploadFileServerFn({
              data: {
                base64Data,
                fileName: path,
                mimeType: file.type || "image/jpeg",
              },
            });
            return { data: { path: resultPath }, error: null };
          } catch (err: any) {
            return { data: null, error: new Error(err.message || "Upload gagal") };
          }
        },

        async createSignedUrl(path: string, expiresIn: number) {
          const url = path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') ? path : `/uploads/${path.replace(/^\\+/, '')}`;
          return { data: { signedUrl: url }, error: null };
        },

        getPublicUrl(path: string) {
          const url = path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') ? path : `/uploads/${path.replace(/^\\+/, '')}`;
          return { data: { publicUrl: url } };
        },
      };
    },
  },

  from(table: string) {
    const filters: Record<string, any> = {};
    let sort: { field?: string; ascending?: boolean } = {};
    let limitNum: number | undefined;
    let pendingAction:
      | { type: "insert"; payload: any }
      | { type: "update"; payload: any }
      | { type: "upsert"; payload: any; options?: any }
      | { type: "delete" }
      | undefined;

    const builder = {
      select(_cols?: string, _opts?: any) {
        return builder;
      },
      eq(column: string, val: any) {
        filters[column] = val;
        return builder;
      },
      gte(column: string, val: any) {
        filters[`${column}_gte`] = val;
        return builder;
      },
      lte(column: string, val: any) {
        filters[`${column}_lte`] = val;
        return builder;
      },
      order(column: string, opts?: { ascending?: boolean }) {
        sort = { field: column, ascending: opts?.ascending ?? true };
        return builder;
      },
      limit(n: number) {
        limitNum = n;
        return builder;
      },
      insert(payload: any) {
        pendingAction = { type: "insert", payload };
        return builder;
      },
      update(payload: any) {
        pendingAction = { type: "update", payload };
        return builder;
      },
      upsert(payload: any, options?: any) {
        pendingAction = { type: "upsert", payload, options };
        return builder;
      },
      delete() {
        pendingAction = { type: "delete" };
        return builder;
      },
      async maybeSingle() {
        const res = await builder.execute();
        if (res.error) return { data: null, error: res.error };
        const row = Array.isArray(res.data) ? (res.data[0] ?? null) : res.data;
        return { data: row, error: null };
      },
      async single() {
        return builder.maybeSingle();
      },
      async execute() {
        try {
          if (pendingAction) {
            if (pendingAction.type === "insert") {
              let data: any = null;
              if (table === "announcements") {
                data = await createAnnouncementServerFn({ data: pendingAction.payload });
              } else if (table === "leave_requests") {
                data = await submitLeaveRequestServerFn({ data: pendingAction.payload });
              } else if (table === "teachers") {
                data = await createTeacherServerFn({ data: pendingAction.payload });
              } else if (table === "activity_logs") {
                data = await logActivityServerFn({ data: pendingAction.payload });
              }
              return { data, error: null };
            }

            if (pendingAction.type === "update") {
              let data: any = null;
              const targetId = filters["id"] ?? filters["user_id"];
              if (table === "school_settings") {
                data = await updateSchoolSettingsServerFn({ data: pendingAction.payload });
              } else if (table === "leave_requests") {
                data = await updateLeaveStatusServerFn({
                  data: {
                    id: targetId,
                    status: pendingAction.payload.status,
                    catatan_admin: pendingAction.payload.catatan_admin,
                  },
                });
              } else if (table === "teachers") {
                data = await updateTeacherServerFn({
                  data: { id: targetId, data: pendingAction.payload },
                });
              } else if (table === "profiles") {
                data = await updateProfileServerFn({
                  data: { id: targetId, data: pendingAction.payload },
                });
              }
              return { data, error: null };
            }

            if (pendingAction.type === "upsert") {
              let data: any = null;
              if (table === "attendance") {
                data = await recordAttendanceServerFn({ data: pendingAction.payload });
              }
              return { data, error: null };
            }

            if (pendingAction.type === "delete") {
              let data: any = null;
              const targetId = filters["id"];
              if (table === "announcements") {
                data = await deleteAnnouncementServerFn({ data: { id: targetId } });
              } else if (table === "teachers") {
                data = await deleteTeacherServerFn({ data: { id: targetId } });
              }
              return { data, error: null };
            }
          }

          // Select / Fetch
          let result: any = null;
          let countResult: number | null = null;

          if (table === "attendance") {
            const teacherId = filters["teacher_id"];
            if (teacherId) {
              result = await getAttendanceHistoryServerFn({
                data: {
                  teacherId,
                  dari: filters["tanggal_gte"],
                  sampai: filters["tanggal_lte"],
                },
              });
            } else {
              const attData: { dari?: string; sampai?: string; limit?: number } = {
                dari: filters["tanggal_gte"],
                sampai: filters["tanggal_lte"],
              };
              if (limitNum !== undefined) attData.limit = limitNum;
              result = await getAllAttendanceServerFn({ data: attData });
            }
          } else if (table === "teachers") {
            const userId = filters["user_id"];
            if (userId) {
              const all = await getAllTeachersServerFn();
              result = all.find((t: any) => t.user_id === userId) ?? null;
            } else {
              result = await getAllTeachersServerFn();
            }
            if (Array.isArray(result)) {
              countResult = result.length;
            }
          } else if (table === "school_settings") {
            result = await getSchoolSettingsServerFn();
          } else if (table === "announcements") {
            result = await getAllAnnouncementsServerFn();
          } else if (table === "leave_requests") {
            const teacherId = filters["teacher_id"];
            if (teacherId) {
              result = await getTeacherLeaveRequestsServerFn({ data: { teacherId } });
            } else {
              result = await getAllLeaveRequestsServerFn();
            }
          } else if (table === "activity_logs") {
            result = await getActivityLogsServerFn({ data: { limit: limitNum ?? 100 } });
          } else if (table === "profiles") {
            const userId = filters["id"];
            if (userId) {
              result = await getProfileServerFn({ data: { id: userId } });
            }
          } else if (table === "user_roles") {
            const userId = filters["user_id"];
            if (userId) {
              const teacher = (await getAllTeachersServerFn()).find((t: any) => t.user_id === userId);
              result = { role: teacher ? "guru" : "admin" };
            }
          }

          return { data: result, count: countResult, error: null };
        } catch (err: any) {
          return { data: null, count: null, error: new Error(err.message || "Error") };
        }
      },
      then(onfulfilled?: ((value: any) => any) | null, onrejected?: ((reason: any) => any) | null) {
        return builder.execute().then(onfulfilled, onrejected);
      },
    };

    return builder;
  },
};
