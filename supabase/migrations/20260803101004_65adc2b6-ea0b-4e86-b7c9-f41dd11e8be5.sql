
CREATE TYPE public.app_role AS ENUM ('admin','guru');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  nama_lengkap text NOT NULL DEFAULT '',
  email text,
  nomor_telepon text,
  alamat text,
  foto_profil text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles select" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles insert admin" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') OR id = auth.uid());
CREATE POLICY "profiles delete admin" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nip text,
  nama_lengkap text NOT NULL,
  jenis_kelamin text,
  tempat_lahir text,
  tanggal_lahir date,
  alamat text,
  nomor_telepon text,
  email text,
  pendidikan_terakhir text,
  mata_pelajaran text,
  jabatan text,
  status_kepegawaian text,
  tanggal_masuk date,
  foto_profil text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teachers TO authenticated;
GRANT ALL ON public.teachers TO service_role;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teachers select" ON public.teachers FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "teachers insert admin" ON public.teachers FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "teachers update" ON public.teachers FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "teachers delete admin" ON public.teachers FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_teachers_updated BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  tanggal date NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')::date,
  jam_masuk timestamptz,
  jam_keluar timestamptz,
  status text NOT NULL DEFAULT 'hadir',
  latitude double precision,
  longitude double precision,
  jarak double precision,
  foto_masuk text,
  foto_keluar text,
  catatan text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, tanggal)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance select" ON public.attendance FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.teachers t WHERE t.id = teacher_id AND t.user_id = auth.uid()));
CREATE POLICY "attendance insert" ON public.attendance FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.teachers t WHERE t.id = teacher_id AND t.user_id = auth.uid()));
CREATE POLICY "attendance update" ON public.attendance FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.teachers t WHERE t.id = teacher_id AND t.user_id = auth.uid())) WITH CHECK (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.teachers t WHERE t.id = teacher_id AND t.user_id = auth.uid()));
CREATE POLICY "attendance delete admin" ON public.attendance FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_attendance_updated BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  kategori text NOT NULL,
  tanggal_mulai date NOT NULL,
  tanggal_selesai date NOT NULL,
  alasan text NOT NULL,
  dokumen text,
  status text NOT NULL DEFAULT 'menunggu',
  catatan_admin text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leave_requests TO authenticated;
GRANT ALL ON public.leave_requests TO service_role;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leave select" ON public.leave_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.teachers t WHERE t.id = teacher_id AND t.user_id = auth.uid()));
CREATE POLICY "leave insert" ON public.leave_requests FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.teachers t WHERE t.id = teacher_id AND t.user_id = auth.uid()));
CREATE POLICY "leave update" ON public.leave_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "leave delete" ON public.leave_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.teachers t WHERE t.id = teacher_id AND t.user_id = auth.uid()));
CREATE TRIGGER trg_leave_updated BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.school_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_sekolah text NOT NULL DEFAULT 'MTS Math''laul Anwar Napal',
  alamat text,
  latitude double precision NOT NULL DEFAULT -6.2,
  longitude double precision NOT NULL DEFAULT 106.816666,
  radius integer NOT NULL DEFAULT 150,
  jam_masuk time NOT NULL DEFAULT '07:00',
  jam_pulang time NOT NULL DEFAULT '14:00',
  logo text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.school_settings TO authenticated;
GRANT ALL ON public.school_settings TO service_role;
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings select" ON public.school_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings write admin" ON public.school_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
INSERT INTO public.school_settings (nama_sekolah, alamat, latitude, longitude, radius) VALUES ('MTS Math''laul Anwar Napal','Napal, Banten', -6.352000, 106.010000, 200);

CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  judul text NOT NULL,
  isi_pengumuman text NOT NULL,
  tanggal date NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')::date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "announcements select" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "announcements write admin" ON public.announcements FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  aksi text NOT NULL,
  keterangan text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs select" ON public.activity_logs FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "logs insert" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
