export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          aksi: string
          created_at: string
          id: string
          keterangan: string | null
          user_id: string | null
        }
        Insert: {
          aksi: string
          created_at?: string
          id?: string
          keterangan?: string | null
          user_id?: string | null
        }
        Update: {
          aksi?: string
          created_at?: string
          id?: string
          keterangan?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          created_at: string
          id: string
          isi_pengumuman: string
          judul: string
          tanggal: string
        }
        Insert: {
          created_at?: string
          id?: string
          isi_pengumuman: string
          judul: string
          tanggal?: string
        }
        Update: {
          created_at?: string
          id?: string
          isi_pengumuman?: string
          judul?: string
          tanggal?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          catatan: string | null
          created_at: string
          foto_keluar: string | null
          foto_masuk: string | null
          id: string
          jam_keluar: string | null
          jam_masuk: string | null
          jarak: number | null
          latitude: number | null
          longitude: number | null
          status: string
          tanggal: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          foto_keluar?: string | null
          foto_masuk?: string | null
          id?: string
          jam_keluar?: string | null
          jam_masuk?: string | null
          jarak?: number | null
          latitude?: number | null
          longitude?: number | null
          status?: string
          tanggal?: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          foto_keluar?: string | null
          foto_masuk?: string | null
          id?: string
          jam_keluar?: string | null
          jam_masuk?: string | null
          jarak?: number | null
          latitude?: number | null
          longitude?: number | null
          status?: string
          tanggal?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          alasan: string
          catatan_admin: string | null
          created_at: string
          dokumen: string | null
          id: string
          kategori: string
          status: string
          tanggal_mulai: string
          tanggal_selesai: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          alasan: string
          catatan_admin?: string | null
          created_at?: string
          dokumen?: string | null
          id?: string
          kategori: string
          status?: string
          tanggal_mulai: string
          tanggal_selesai: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          alasan?: string
          catatan_admin?: string | null
          created_at?: string
          dokumen?: string | null
          id?: string
          kategori?: string
          status?: string
          tanggal_mulai?: string
          tanggal_selesai?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          alamat: string | null
          created_at: string
          email: string | null
          foto_profil: string | null
          id: string
          nama_lengkap: string
          nomor_telepon: string | null
          updated_at: string
          username: string
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          email?: string | null
          foto_profil?: string | null
          id: string
          nama_lengkap?: string
          nomor_telepon?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          alamat?: string | null
          created_at?: string
          email?: string | null
          foto_profil?: string | null
          id?: string
          nama_lengkap?: string
          nomor_telepon?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      school_settings: {
        Row: {
          alamat: string | null
          id: string
          jam_masuk: string
          jam_pulang: string
          latitude: number
          logo: string | null
          longitude: number
          nama_sekolah: string
          radius: number
          updated_at: string
        }
        Insert: {
          alamat?: string | null
          id?: string
          jam_masuk?: string
          jam_pulang?: string
          latitude?: number
          logo?: string | null
          longitude?: number
          nama_sekolah?: string
          radius?: number
          updated_at?: string
        }
        Update: {
          alamat?: string | null
          id?: string
          jam_masuk?: string
          jam_pulang?: string
          latitude?: number
          logo?: string | null
          longitude?: number
          nama_sekolah?: string
          radius?: number
          updated_at?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          alamat: string | null
          created_at: string
          email: string | null
          foto_profil: string | null
          id: string
          jabatan: string | null
          jenis_kelamin: string | null
          mata_pelajaran: string | null
          nama_lengkap: string
          nip: string | null
          nomor_telepon: string | null
          pendidikan_terakhir: string | null
          status_kepegawaian: string | null
          tanggal_lahir: string | null
          tanggal_masuk: string | null
          tempat_lahir: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          email?: string | null
          foto_profil?: string | null
          id?: string
          jabatan?: string | null
          jenis_kelamin?: string | null
          mata_pelajaran?: string | null
          nama_lengkap: string
          nip?: string | null
          nomor_telepon?: string | null
          pendidikan_terakhir?: string | null
          status_kepegawaian?: string | null
          tanggal_lahir?: string | null
          tanggal_masuk?: string | null
          tempat_lahir?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alamat?: string | null
          created_at?: string
          email?: string | null
          foto_profil?: string | null
          id?: string
          jabatan?: string | null
          jenis_kelamin?: string | null
          mata_pelajaran?: string | null
          nama_lengkap?: string
          nip?: string | null
          nomor_telepon?: string | null
          pendidikan_terakhir?: string | null
          status_kepegawaian?: string | null
          tanggal_lahir?: string | null
          tanggal_masuk?: string | null
          tempat_lahir?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "guru"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "guru"],
    },
  },
} as const
