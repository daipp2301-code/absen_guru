# Teacher's Compass

Buat sebuah aplikasi web modern bernama "Sistem Absensi Guru MTS Math'laul Anwar Napal" dengan desain yang bersih, responsif, sederhana, dan profesional.

Teknologi

Frontend: React atau Next.js

Backend: Node.js

Database: MySQL atau PostgreSQL

ORM: Prisma

Authentication: Username dan password

Storage: Penyimpanan foto

Peta: OpenStreetMap atau Google Maps API

Styling: Tailwind CSS

Desain UI/UX

Gunakan konsep berikut:

Tampilan modern dan minimalis.

Dominasi warna hijau, putih, dan abu-abu.

Desain kartu (card layout).

Animasi ringan.

Responsif untuk desktop dan perangkat seluler.

Sidebar di sebelah kiri.

Header di bagian atas.

Sistem autentikasi

Jangan gunakan login menggunakan Google.

Gunakan sistem berikut:

Administrator

Username awal:

Admin

Password awal:

Admin1234

Administrator dapat mengubah username dan password kapan saja.

Guru

Guru hanya dapat masuk menggunakan username dan password yang dibuat oleh administrator.

Hak akses administrator

Administrator dapat melakukan hal-hal berikut:

Menambahkan data guru.

Mengubah data guru.

Menghapus data guru.

Melihat seluruh riwayat absensi.

Menyetujui izin dan cuti.

Mengelola jadwal kerja.

Mengelola lokasi sekolah.

Mengatur radius lokasi absensi.

Mengelola data profil sekolah.

Mengunduh laporan dalam format PDF dan Excel.

Hak akses guru

Guru dapat melakukan hal-hal berikut:

Login dan logout.

Melakukan absensi masuk.

Melakukan absensi pulang.

Mengunggah foto selfie.

Menggunakan kamera depan dan kamera belakang.

Mengajukan izin.

Mengubah data profil pribadi.

Melihat riwayat absensi.

Sistem lokasi (GPS)

Absensi hanya dapat dilakukan jika pengguna berada dalam radius tertentu dari sekolah.

Contoh pengaturan:

Latitude: ditentukan oleh administrator.

Longitude: ditentukan oleh administrator.

Radius: 100–300 meter.

Sistem harus menampilkan:

Status lokasi.

Jarak dari sekolah.

Waktu absensi.

Peta lokasi.

Sistem foto selfie

Ketentuan:

Kamera depan digunakan untuk swafoto.

Kamera belakang dapat digunakan sebagai alternatif.

Foto disimpan ke dalam server.

Foto ditampilkan pada halaman riwayat absensi.

Fitur izin

Tambahkan kategori berikut:

Sakit.

Izin pribadi.

Dinas luar.

Cuti.

Keperluan keluarga.

Lainnya.

Data yang harus diisi:

Tanggal.

Alasan.

Dokumen pendukung.

Status persetujuan.

Modul dashboard administrator

Tampilkan:

Jumlah guru.

Jumlah guru hadir.

Jumlah guru terlambat.

Jumlah guru yang izin.

Jumlah guru yang sakit.

Grafik kehadiran.

Modul profil pengguna

Data yang dapat diubah:

Foto profil.

Nama lengkap.

Nomor telepon.

Alamat.

Kata sandi.

Alamat email.

Struktur database

Tabel users

id

username

password

role

created_at

updated_at

Tabel teachers

id

nip

nama_lengkap

jenis_kelamin

tempat_lahir

tanggal_lahir

alamat

nomor_telepon

email

pendidikan_terakhir

mata_pelajaran

jabatan

status_kepegawaian

tanggal_masuk

foto_profil

Tabel attendance

id

teacher_id

tanggal

jam_masuk

jam_keluar

status

latitude

longitude

jarak

foto_masuk

foto_keluar

Tabel leave_requests

id

teacher_id

kategori

alasan

dokumen

status

created_at

Tabel school_settings

id

nama_sekolah

alamat

latitude

longitude

radius

Tabel announcements

id

judul

isi_pengumuman

tanggal

Fitur tambahan

Notifikasi otomatis.

Mode gelap.

Pencarian data.

Filter berdasarkan tanggal.

Ekspor PDF.

Ekspor Excel.

Cadangan data otomatis.

Riwayat aktivitas pengguna.

Buat seluruh halaman, komponen, database, API, middleware, autentikasi, dan dashboard secara lengkap agar aplikasi dapat langsung dijalankan.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/59130efa-b81d-45a3-a18b-786f3f22d9a2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
