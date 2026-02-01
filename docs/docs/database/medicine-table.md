Siap 👍 kita **kunci desainnya** sekarang ya.
Targetnya: **simple, realistis, tanpa relasi ribet**, tapi **benar untuk inventory obat**.

---

# ✅ REKOMENDASI FINAL

## 🔹 Konsep Inti (WAJIB PAHAM)

> **1 ROW = 1 BATCH OBAT**

Jadi:

* obat yang sama
* strength sama
* **expired beda**
  ➡️ **harus beda row**

---

## 📦 Tabel: `medicines`

### ✅ Recommended Columns

```text
id
code
name
strength
dosage_form
batch_number
expiration_date
stock
unit
minimum_stock
is_prescription_required
status
notes
created_at
updated_at
```

---

## 🧠 Penjelasan Singkat per Kolom

### Identification

* `id` → primary key
* `code` → kode internal (boleh sama antar batch ATAU unique per batch, pilihanmu)
* `name` → nama obat (Paracetamol)
* `strength` → 500 mg, 120 mg / 5 ml
* `dosage_form` → tablet, capsule, syrup

### Batch & Expired

* `batch_number` → kode produksi
* `expiration_date` → tanggal expired

### Stock

* `stock` → jumlah stok untuk batch ini
* `unit` → tablet, strip, bottle
* `minimum_stock` → alert stok menipis

### Regulation & Status

* `is_prescription_required` → true / false
* `status` → active / inactive
* `notes` → catatan tambahan

### Audit

* `created_at`
* `updated_at`

---

# ⚙️ LOGIC YANG DIPAKAI DI SISTEM

## 1️⃣ Input Obat

Saat input:

* user **selalu input batch baru**
* walaupun nama obat sama

Contoh:

```text
Paracetamol | 500 mg | tablet | BATCH-A | 2025-06-01 | 50
Paracetamol | 500 mg | tablet | BATCH-B | 2026-02-01 | 70
```

---

## 2️⃣ Total Stok per Obat

Stok **jangan disimpan manual**, tapi dihitung:

```sql
SELECT
  name,
  strength,
  SUM(stock) AS total_stock
FROM medicines
WHERE status = 'active'
  AND expiration_date > CURRENT_DATE
GROUP BY name, strength;
```

---

## 3️⃣ Ambil Stok (FEFO)

Saat obat dipakai / keluar:

**Urutan:**

1. expired paling dekat
2. batch lebih lama dulu

Pseudo logic:

```text
sort by expiration_date ASC
reduce stock from first row
```

---

## 4️⃣ Alert Stok Menipis

```sql
SELECT *
FROM medicines
WHERE stock <= minimum_stock
  AND expiration_date > CURRENT_DATE;
```

---

## 5️⃣ Obat Expired

```sql
SELECT *
FROM medicines
WHERE expiration_date <= CURRENT_DATE;
```

Biasanya:

* status → `inactive`
* stock → 0 (opsional, sesuai kebijakan)

---

## 6️⃣ Kenapa `code` boleh sama?

Pilihan desain:

### 🔹 Option A (simple)

```text
code = PARA-500
```

Sama untuk semua batch Paracetamol 500 mg

### 🔹 Option B (strict)

```text
code = PARA-500-BATCH-A
```

👉 Aku rekomendasikan **Option A**, lebih clean.

---
