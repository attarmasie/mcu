---

# 🏥 MCU Klinik Pesantren – Backend API Documentation

Sistem ini digunakan untuk pencatatan **Medical Check Up (MCU)** dan **pemberian obat** di klinik pesantren dengan **kontrol dokter** agar tidak terjadi pemberian obat sembarangan.


link gpt : https://chatgpt.com/share/696f1168-7a6c-8005-bdc1-165e880538bf
---

## 🎯 Tujuan Sistem

* Menangani keluhan santri dengan cepat
* Tetap **aman secara medis**
* Obat bisa:

  * Diambil dari **stok klinik**
  * **Dibeli di luar** jika stok habis
* Semua pemberian obat **harus di-ACC dokter**

---

## 🔐 Role & Hak Akses

### 1️⃣ Admin Klinik

* Kelola pasien
* Kelola stok obat
* Input master penyakit & rekomendasi obat
* Input pembelian obat luar
* Melihat laporan

### 2️⃣ Dokter

* ACC / Tolak pengajuan obat
* Mengubah obat & dosis
* Menjadi penanggung jawab medis

### 3️⃣ Guru / Pengasuh

* Mengajukan pemberian obat untuk santri
* Tidak bisa langsung memberi obat

---

## 🔁 Alur Bisnis (Flow Nyata)

### 🧠 Flow Pemberian Obat

1. Dokter/Admin input **master penyakit**
2. Dokter/Admin input **rekomendasi obat + dosis berdasarkan umur**
3. Santri mengeluh ke guru
4. Guru membuat **pengajuan obat**
5. Sistem menampilkan rekomendasi obat
6. Dokter:

   * APPROVE
   * atau EDIT
   * atau REJECT
7. Jika **stok ada** → obat diberikan
8. Jika **stok habis**:

   * Obat **dibeli di luar**
   * Tetap dicatat di sistem
9. Riwayat medis tersimpan

👉 **Tidak ada obat keluar tanpa ACC dokter**

---

## 🧱 Entity Relationship Diagram (ERD) – dbdiagram.io (DBML)

Link : https://dbdiagram.io/d/696f0c53d6e030a02487f30f

```dbml
Table users {
  id bigint [pk, increment]
  nama varchar
  username varchar [unique]
  password varchar
  role varchar [note: "ADMIN | DOKTER | GURU"]
  created_at datetime
}

Table patients {
  id bigint [pk, increment]
  nama varchar
  jenis_pasien varchar [note: "SANTRI | GURU"]
  nik_nis varchar
  tanggal_lahir date
  jenis_kelamin varchar
}

Table diseases {
  id bigint [pk, increment]
  nama varchar
  deskripsi text
}

Table medicines {
  id bigint [pk, increment]
  nama_obat varchar
  satuan varchar
  stok int
  stok_minimum int
}

Table disease_medicine_recommendations {
  id bigint [pk, increment]
  disease_id bigint
  medicine_id bigint
  umur_min int
  umur_max int
  dosis varchar
}

Table medicine_requests {
  id bigint [pk, increment]
  patient_id bigint
  disease_id bigint
  requested_by bigint
  status varchar [note: "PENDING | APPROVED | REJECTED"]
  approved_by bigint
  approved_at datetime
  catatan text
}

Table medicine_request_items {
  id bigint [pk, increment]
  medicine_request_id bigint
  medicine_id bigint
  jumlah int
  dosis varchar
  source varchar [note: "INTERNAL | EXTERNAL"]
}

Table visits {
  id bigint [pk, increment]
  patient_id bigint
  doctor_id bigint
  tanggal_berobat datetime
  diagnosis text
}

/* Relations */
Ref: medicine_requests.patient_id > patients.id
Ref: medicine_requests.requested_by > users.id
Ref: medicine_requests.approved_by > users.id
Ref: medicine_requests.disease_id > diseases.id

Ref: medicine_request_items.medicine_request_id > medicine_requests.id
Ref: medicine_request_items.medicine_id > medicines.id

Ref: disease_medicine_recommendations.disease_id > diseases.id
Ref: disease_medicine_recommendations.medicine_id > medicines.id
```

---

## 🌐 API Endpoint List

### 🔐 Authentication

| Method | Endpoint          | Description  |
| ------ | ----------------- | ------------ |
| POST   | `/api/auth/login` | Login        |
| GET    | `/api/auth/me`    | Current user |

---

### 👤 Patients

| Method | Endpoint             |
| ------ | -------------------- |
| GET    | `/api/patients`      |
| POST   | `/api/patients`      |
| GET    | `/api/patients/{id}` |

---

### 🦠 Diseases & Recommendation

| Method | Endpoint                             |
| ------ | ------------------------------------ |
| GET    | `/api/diseases`                      |
| POST   | `/api/diseases`                      |
| POST   | `/api/diseases/{id}/recommendations` |

---

### 💊 Medicine Requests (CORE)

#### Guru – Ajukan

```http
POST /api/medicine-requests
```

```json
{
  "patient_id": 1,
  "disease_id": 2
}
```

---

#### Dokter – Approval

```http
PUT /api/medicine-requests/{id}/approve
```

```json
{
  "items": [
    {
      "medicine_id": 3,
      "jumlah": 10,
      "dosis": "3x1",
      "source": "INTERNAL"
    },
    {
      "medicine_id": 5,
      "jumlah": 1,
      "dosis": "1x1",
      "source": "EXTERNAL"
    }
  ]
}
```

📌 `source = EXTERNAL` → stok **tidak dikurangi**

---

### 💊 Medicines

| Method | Endpoint                   |
| ------ | -------------------------- |
| GET    | `/api/medicines`           |
| POST   | `/api/medicines`           |
| GET    | `/api/medicines/low-stock` |

---

### 📊 Reports

| Endpoint                          | Description       |
| --------------------------------- | ----------------- |
| `/api/reports/requests`           | Riwayat pengajuan |
| `/api/reports/external-medicines` | Obat beli luar    |
| `/api/reports/usage`              | Pemakaian obat    |

---

## 📦 Status & Validasi Penting

* ❌ Tidak boleh approve jika:

  * Status bukan `PENDING`
* ❌ Guru tidak boleh approve
* ✅ Obat `EXTERNAL` tidak mengurangi stok
* ✅ Semua approval tercatat (audit trail)

