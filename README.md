# TaskLink Ecosystem - Fullstack Project Management Workspace

TaskLink adalah ekosistem aplikasi manajemen workspace terintegrasi yang dibangun menggunakan arsitektur modern berkinerja tinggi. Proyek ini mencakup backend RESTful API berbasis .NET 8, aplikasi web interaktif menggunakan React (Vite), serta aplikasi mobile/web multi-platform menggunakan Flutter. Ekosistem ini mengimplementasikan autentikasi JWT token pengaman dan operasi CRUD relasional yang kuat antar entitas.



---

## 🛠️ Teknologi Utama & Pola Desain (Architecture)

### 1. Backend API (`TaskLink.API` & `TaskLink.Infrastructure`)
- **Framework & Runtime:** ASP.NET Core 8.0 Web API (RESTful)
- **Arsitektur:** Terstruktur dan Modular (Clean/Separation of Concerns). Memisahkan lapisan API (Controllers/Middleware) dengan lapisan Data/Persistence.
- **Database Engine:** PostgreSQL
- **Interaksi Database (CQRS Optimization):**
  - **READ Operations:** Menggunakan pendekatan optimasi performa tinggi lewat **Raw SQL Queries** via koneksi database langsung untuk memproses penampilan data secara instan.
  - **WRITE Operations (Create, Update, Delete):** Menggunakan **Entity Framework Core (Code First)** untuk memanipulasi data objek dengan aman dan konsisten.
- **Keamanan:** Autentikasi terproteksi menggunakan **JWT Bearer Token Validation**, Password Hashing, dan kebijakan pengetatan Cross-Origin Resource Sharing (CORS).
- **Mekanisme Robust:** **Global Exception Handling Middleware** untuk menangkap kegagalan sistem secara otomatis, serta **Serilog Logging** terstruktur yang mencatat berkas log ke folder lokal secara berkala.
- **Dokumentasi:** Swagger UI / OpenAPI.

### 2. Frontend Web Pro (`tasklink-web`)
- **Framework:** React JS menggunakan bundler super cepat **Vite**.
- **State Management:** **React Context API** untuk enkapsulasi global state token session dan data profile pengguna.
- **HTTP Client:** Native **Fetch API** dengan interseptor token dinamis di dalam *Authorization Header*.
- **UI Styling:** Clean Modern Light Theme (Bebas Emoji, profesional, responsif untuk desktop dan tablet).

### 3. Frontend Mobile (`tasklink_mobile`)
- **Framework:** Flutter (Mendukung Web Chrome Rendering dan Android Native SDK).
- **State Management & Session:** Stateful Lifecycle, dikombinasikan dengan **Shared Preferences** untuk enkapsulasi session JWT Token yang persisten di dalam storage lokal perangkat fisik/browser.
- **HTTP Client:** **HTTP Package** untuk penembakan REST API secara asinkronus.
- **UI/UX:** Mengikuti pedoman *Material Design 3* yang bersih, memanfaatkan komponen multi-tab view, form penanganan validasi, serta relasi data drop-down dinamis.

---

## 📂 Struktur Repositori Proyek
```text
SarastyaTest/
│
├── TaskLink.sln                          # Solusi Induk Visual Studio .NET
├── TaskLink.API/                         # Proyek Lapangan Web API Controllers & Middleware
├── TaskLink.Infrastructure/              # Proyek Lapangan Basis Data, Migrasi, & Entitas EF Core
├── tasklink-web/                         # Proyek Aplikasi Frontend Web React (Vite)
└── tasklink_mobile/                      # Proyek Aplikasi Frontend Mobile/Web (Flutter)