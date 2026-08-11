
CREATE POLICY "absensi upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'absensi');
CREATE POLICY "absensi read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'absensi');
CREATE POLICY "absensi update own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'absensi' AND owner = auth.uid());
CREATE POLICY "absensi delete own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'absensi' AND owner = auth.uid());
