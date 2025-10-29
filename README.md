# EcoHabit — Tracker Kebiasaan Ramah Lingkungan

Proyek web full stack untuk membantu pengguna membangun kebiasaan kecil yang mendukung keberlanjutan lingkungan.

## 🎯 Tujuan
Membantu pengguna membangun kebiasaan ramah lingkungan melalui sistem poin dan level, mendukung SDG 12 & 13.

## 🚀 Fitur Utama

### 🔐 Autentikasi Pengguna
- Register & Login dengan validasi
- Forgot Password dengan email reset
- Proteksi route dengan JWT

### 🌿 Dashboard
- Daftar aktivitas hijau dengan sistem poin
- Level & badge system berdasarkan total poin
- Quote & challenge harian
- Statistik mingguan dengan Chart.js

## 🛠️ Teknologi

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT untuk autentikasi
- bcryptjs untuk hash password
- Nodemailer untuk email

**Frontend:**
- HTML5 + CSS3 + JavaScript
- Chart.js untuk statistik
- Tailwind-inspired CSS

## 📦 Instalasi & Menjalankan

### Prerequisites
- Node.js (v14 atau lebih tinggi)
- MongoDB (local atau MongoDB Atlas)
- Email account (untuk fitur forgot password)

### Backend Setup
1. Masuk ke folder backend:
```bash
cd backend
