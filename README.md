# Web Absensi

<p align="center">
  <img src="https://raw.githubusercontent.com/khadafiach-max/Absensi-app/main/public/logo.png" width="180" alt="Web Absensi Logo">
</p>

<p align="center">
  <strong>Sistem Absensi Digital Modern Berbasis Web</strong><br>
  Dibangun menggunakan Laravel untuk mempermudah pengelolaan kehadiran siswa, karyawan, maupun anggota organisasi secara efisien dan real-time.
</p>

---

## Tentang Web Absensi

Web Absensi adalah aplikasi berbasis web yang dirancang untuk membantu proses pencatatan kehadiran secara digital dengan tampilan modern, cepat, dan mudah digunakan.  
Aplikasi ini dibuat menggunakan framework Laravel dan dapat digunakan oleh sekolah, perusahaan, maupun organisasi untuk memonitor data absensi secara lebih efektif.

Dengan sistem ini, proses absensi menjadi lebih praktis tanpa perlu pencatatan manual.

---

## Preview Website

- Dashboard Admin Modern
- Sistem Login Authentication
- Manajemen Data Absensi
- Rekap Kehadiran
- Responsive Design

Local URL:

```bash
http://127.0.0.1:8000/
```

---

## Fitur Utama

- Login & Authentication
- Dashboard
- Manajemen Data Absensi
- Rekap Kehadiran
- Validasi Form
- Notifikasi & Alert
- Database Management dengan Laravel Migration
- Routing dan Middleware Laravel
- Rekap karyawan
- Shift Manajemen

---

## Teknologi yang Digunakan

### Backend
- PHP
- Laravel
- MySQL

### Frontend
- Blade / React
- Tailwind CSS
- Bootstrap
- JavaScript

### Tools
- Composer
- Vite
- Git & GitHub

---

## Instalasi Project

### 1. Clone Repository

```bash
git clone https://github.com/khadafiach-max/Absensi-app.git
```

### 2. Masuk ke Folder Project

```bash
cd Absensi-app
```

### 3. Install Dependency

```bash
composer install
npm install
```

### 4. Copy File Environment

```bash
cp .env.example .env
```

### 5. Generate Application Key

```bash
php artisan key:generate
```

### 6. Konfigurasi Database

Edit file `.env`

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=absensi
DB_USERNAME=root
DB_PASSWORD=
```

### 7. Jalankan Migration

```bash
php artisan migrate
```

### 8. Jalankan Vite

```bash
npm run dev
```

### 9. Jalankan Server Laravel

```bash
php artisan serve
```

Server akan berjalan di:

```bash
http://127.0.0.1:8000/
```

---

## Struktur Fitur

| Fitur | Deskripsi |
|---|---|
| Authentication | Login dan proteksi halaman |
| Dashboard | Tampilan data utama sistem |
| Absensi | Input dan pengelolaan kehadiran |
| Database Migration | Struktur database Laravel |

---

## Tujuan Project

Project ini dibuat untuk:

- Mempermudah proses absensi digital
- Mengurangi penggunaan absensi manual
- Melatih pengembangan aplikasi berbasis Laravel
- Menerapkan konsep Fullstack Web Development

---

## Repository GitHub

🔗 GitHub Repository:  
https://github.com/khadafiach-max/Absensi-app

---

## Developer

**Achmad Khadafi**  
Web Developer

---

## License

Project ini dibuat untuk kebutuhan pembelajaran, pengembangan portofolio, dan implementasi sistem absensi berbasis web.
