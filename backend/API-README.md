# EcoHabit API Documentation

Dokumentasi ini menjelaskan semua endpoint yang tersedia untuk aplikasi EcoHabit.

---

## 🩺 Health Check

Endpoint ini digunakan untuk memverifikasi status server dan koneksi database.

### `GET /api/health`

* **Deskripsi:** Memeriksa status server dan koneksi database.
* **Autentikasi:** Tidak diperlukan.
* **Contoh Output (Sukses 200):**
    ```json
    {
      "status": "OK",
      "database": "Connected",
      "timestamp": "2025-10-30T07:00:00.000Z"
    }
    ```

---

## 🔐 Autentikasi (`/api/auth`)

Endpoint ini mengelola registrasi, login, dan pemulihan password pengguna.

### `POST /api/auth/register`

* **Deskripsi:** Mendaftarkan pengguna baru.
* **Autentikasi:** Tidak diperlukan.
* **Request Body (Input):**
    ```json
    {
      "name": "Pengguna Baru",
      "email": "user@example.com",
      "password": "password123"
    }
    ```
* **Contoh Output (Sukses 201):**
    ```json
    {
      "message": "User berhasil dibuat",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzkxYj...",
      "user": {
        "id": "6791b12a1b1234567890abcd",
        "name": "Pengguna Baru",
        "email": "user@example.com",
        "totalPoints": 0,
        "level": "Green Starter"
      }
    }
    ```
* **Contoh Output (Error 400):**
    ```json
    {
      "message": "User dengan email ini sudah terdaftar"
    }
    ```

### `POST /api/auth/login`

* **Deskripsi:** Melakukan login pengguna.
* **Autentikasi:** Tidak diperlukan.
* **Request Body (Input):**
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```
* **Contoh Output (Sukses 200):**
    ```json
    {
      "message": "Login berhasil",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzkxYj...",
      "user": {
        "id": "6791b12a1b1234567890abcd",
        "name": "Pengguna Baru",
        "email": "user@example.com",
        "totalPoints": 50,
        "level": "Green Starter"
      }
    }
    ```
* **Contoh Output (Error 400):**
    ```json
    {
      "message": "Email atau password salah"
    }
    ```

### `POST /api/auth/forgot`

* **Deskripsi:** Meminta link reset password melalui email.
* **Autentikasi:** Tidak diperlukan.
* **Request Body (Input):**
    ```json
    {
      "email": "user@example.com"
    }
    ```
* **Contoh Output (Sukses 200):**
    ```json
    {
      "message": "Email reset password telah dikirim"
    }
    ```
* **Contoh Output (Error 404):**
    ```json
    {
      "message": "User dengan email ini tidak ditemukan"
    }
    ```

### `POST /api/auth/reset/:token`

* **Deskripsi:** Mereset password pengguna menggunakan token dari email.
* **Autentikasi:** Tidak diperlukan.
* **Request Body (Input):**
    ```json
    {
      "password": "passwordbaru123"
    }
    ```
* **Contoh Output (Sukses 200):**
    ```json
    {
      "message": "Password berhasil direset"
    }
    ```
* **Contoh Output (Error 400):**
    ```json
    {
      "message": "Token tidak valid atau sudah kadaluarsa"
    }
    ```

---

## 🏃 Aktivitas (`/api/activities`)

Endpoint ini mengelola daftar aktivitas ramah lingkungan yang tersedia.

### `GET /api/activities`

* **Deskripsi:** Mendapatkan semua daftar aktivitas yang tersedia.
* **Autentikasi:** **Diperlukan** (`Authorization: Bearer <token>`).
* **Contoh Output (Sukses 200):**
    ```json
    [
      {
        "_id": "6791b12a1b1234567890def1",
        "name": "Tanam pohon",
        "points": 30,
        "impact_co2_kg": 0,
        "impact_water_liter": 0,
        "impact_plastic_gram": 0,
        "createdAt": "2025-10-30T07:00:00.000Z",
        "updatedAt": "2025-10-30T07:00:00.000Z"
      },
      {
        "_id": "6791b12a1b1234567890def2",
        "name": "Gunakan transportasi umum",
        "points": 20,
        "impact_co2_kg": 1.0,
        "impact_water_liter": 0,
        "impact_plastic_gram": 0,
        "createdAt": "2025-10-30T07:00:00.000Z",
        "updatedAt": "2025-10-30T07:00:00.000Z"
      },
      {
        "_id": "6791b12a1b1234567890def3",
        "name": "Bawa tumbler minum",
        "points": 10,
        "impact_co2_kg": 0.08,
        "impact_water_liter": 2,
        "impact_plastic_gram": 20,
        "createdAt": "2025-10-30T07:00:00.000Z",
        "updatedAt": "2025-10-30T07:00:00.000Z"
      }
    ]
    ```

---

## 📈 Progress Pengguna (`/api/progress`)

Endpoint ini melacak aktivitas harian, poin, dan total dampak lingkungan pengguna.

### `GET /api/progress/`

* **Deskripsi:** Mendapatkan data progress pengguna untuk 7 hari terakhir, data hari ini, dan total poin.
* **Autentikasi:** **Diperlukan** (`Authorization: Bearer <token>`).
* **Contoh Output (Sukses 200):**
    ```json
    {
      "progress": [
        {
          "_id": "6791b12a1b1234567890pqr1",
          "user": "6791b12a1b1234567890abcd",
          "date": "2025-10-28T00:00:00.000Z",
          "activities": [
            { "name": "Bawa tumbler minum", "points": 10, "completed": true }
          ],
          "dailyPoints": 10
        },
        {
          "_id": "6791b12a1b1234567890pqr2",
          "user": "6791b12a1b1234567890abcd",
          "date": "2025-10-30T00:00:00.000Z",
          "activities": [
            { "name": "Gunakan transportasi umum", "points": 20, "completed": true },
            { "name": "Matikan lampu saat tidak digunakan", "points": 5, "completed": true }
          ],
          "dailyPoints": 25
        }
      ],
      "chartData": [
        { "date": "2025-10-24", "points": 0 },
        { "date": "2025-10-25", "points": 0 },
        { "date": "2025-10-26", "points": 0 },
        { "date": "2025-10-27", "points": 0 },
        { "date": "2025-10-28", "points": 10 },
        { "date": "2025-10-29", "points": 0 },
        { "date": "2025-10-30", "points": 25 }
      ],
      "todayProgress": [
        { "name": "Gunakan transportasi umum", "points": 20, "completed": true },
        { "name": "Matikan lampu saat tidak digunakan", "points": 5, "completed": true }
      ],
      "totalPoints": 55,
      "level": "Eco Explorer"
    }
    ```

### `POST /api/progress/update`

* **Deskripsi:** Mencatat aktivitas baru yang diselesaikan oleh pengguna hari ini.
* **Autentikasi:** **Diperlukan** (`Authorization: Bearer <token>`).
* **Request Body (Input):**
    ```json
    {
      "activityName": "Bawa tumbler minum"
    }
    ```
* **Contoh Output (Sukses 200):**
    ```json
    {
      "progress": {
        "_id": "6791b12a1b1234567890pqr3",
        "user": "6791b12a1b1234567890abcd",
        "date": "2025-10-30T00:00:00.000Z",
        "activities": [
          {
            "name": "Bawa tumbler minum",
            "points": 10,
            "completed": true,
            "completedAt": "2025-10-30T07:15:00.000Z",
            "_id": "6791b12a1b1234567890act1"
          }
        ],
        "dailyPoints": 10,
        "createdAt": "2025-10-30T07:15:00.000Z",
        "updatedAt": "2025-10-30T07:15:00.000Z"
      },
      "totalPoints": 65,
      "level": "Eco Explorer",
      "message": "+10 poin untuk Bawa tumbler minum!"
    }
    ```
* **Contoh Output (Error 400):**
    ```json
    {
      "message": "Aktivitas sudah dicatat hari ini"
    }
    ```

### `GET /api/progress/savings`

* **Deskripsi:** Mendapatkan total akumulasi dampak lingkungan (penghematan) dari semua aktivitas yang pernah dicatat pengguna.
* **Autentikasi:** **Diperlukan** (`Authorization: Bearer <token>`).
* **Contoh Output (Sukses 200):**
    ```json
    {
      "total_co2_kg": "12.50",
      "total_water_liter": "45.00",
      "total_plastic_gram": "120.00"
    }
    ```

---

## 🏆 Pengguna (`/api/users`)

Endpoint ini mengelola data terkait pengguna, seperti papan peringkat.

### `GET /api/users/leaderboard`

* **Deskripsi:** Mendapatkan 5 pengguna dengan total poin tertinggi.
* **Autentikasi:** **Diperlukan** (`Authorization: Bearer <token>`).
* **Contoh Output (Sukses 200):**
    ```json
    [
      {
        "_id": "6791b12a1b1234567890user1",
        "name": "Siti Lestari",
        "totalPoints": 350,
        "level": "Climate Guardian"
      },
      {
        "_id": "6791b12a1b1234567890user2",
        "name": "Budi Hartono",
        "totalPoints": 280,
        "level": "Planet Hero"
      },
      {
        "_id": "6791b12a1b1234567890user3",
        "name": "Eka Cahyadi",
        "totalPoints": 120,
        "level": "Eco Explorer"
      },
      {
        "_id": "6791b12a1b1234567890abcd",
        "name": "Pengguna Baru",
        "totalPoints": 65,
        "level": "Eco Explorer"
      },
      {
        "_id": "6791b12a1b1234567890user5",
        "name": "Dewi Anggraini",
        "totalPoints": 30,
        "level": "Green Starter"
      }
    ]
    ```

---

## 💡 Kutipan (`/api/quotes`)

Endpoint ini menyediakan kutipan motivasi.

### `GET /api/quotes/random`

* **Deskripsi:** Mendapatkan satu kutipan motivasi acak.
* **Autentikasi:** Tidak diperlukan.
* **Contoh Output (Sukses 200):**
    ```json
    {
      "_id": "6791b12a1b1234567890qot1",
      "text": "Bumi tidak warisan dari nenek moyang kita, tapi pinjaman untuk anak cucu kita.",
      "author": "Peribahasa Indian"
    }
    ```
* **Contoh Output (Jika DB kosong):**
    ```json
    {
      "text": "Setiap tindakan kecil untuk lingkungan membawa perubahan besar untuk masa depan.",
      "author": "EcoHabit"
    }
    ```
