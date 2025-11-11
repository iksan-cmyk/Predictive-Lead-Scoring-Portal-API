# Predictive-Lead-Scoring-Portal-API


## Studi Kasus
Sebuah perusahaan perbankan ingin meningkatkan efektivitas kampanye outbound call untuk produk deposito berjangka. Saat ini, tim sales masih menargetkan nasabah secara acak berdasarkan data demografi dasar, sehingga tingkat konversi rendah dan biaya operasional tinggi.
Untuk mengatasi masalah tersebut, dikembangkanlah Predictive Lead Scoring Portal, yaitu sistem berbasis machine learning yang dapat memprediksi peluang seorang nasabah untuk berlangganan produk deposito. Tim sales akan menggunakan aplikasi web ini untuk melihat prioritas nasabah berdasarkan skor probabilitas hasil prediksi model.
Backend bertugas membangun RESTful API yang akan:
* Mengelola data nasabah dan pengguna,
* Menyediakan endpoint prediksi yang memuat model ML (ONNX) untuk inferensi, dan
* Menyediakan keamanan autentikasi berbasis JWT.
Aplikasi ini akan berjalan lokal menggunakan Node.js + Hapi.js, dan menyimpan data menggunakan SQLite.


## Struktur Proyek
src/

├─ server.js

├─ routes/

│  ├─ auth.js

│  ├─ predict.js

│  └─ leads.js

├─ services/

│  ├─ modelService.js

│  ├─ dbService.js

│  └─ authService.js

├─ utils/

│  └─ validators.js

└─ config/

   └─ database.js

model/

└─ model.onnx



## Kriteria 1: Konfigurasi
* Aplikasi HTTP Server dapat dijalankan menggunakan perintah npm run start.
* Model ONNX harus dimuat satu kali saat server dijalankan.
* Server menggunakan SQLite sebagai penyimpanan data.

## Autentikasi Pengguna
* menggunkana jwt

| Endpoint               | Body Request                             | Response                                                                                                                           | Keterangan                                                     |
| ---------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **POST /register**     | `username`: string<br>`password`: string | **status code:** 201 (Created)<br>**body:**<br>{<br>"status": "success",<br>"message": "User registered successfully"<br>}         | Menambahkan pengguna baru ke database. Password wajib di-hash. |
| **POST /login**        | `username`: string<br>`password`: string | **status code:** 200 (OK)<br>**body:**<br>{<br>"status": "success",<br>"message": "Login successful",<br>"token": "jwt_token"<br>} | Melakukan autentikasi pengguna dan mengembalikan JWT token.    |
| **GET /users/profile** | -                                        | **status code:** 200 (OK)<br>**body:**<br>{<br>"status": "success",<br>"data": {<br>"username": "jake off"<br>}<br>}                  | Mendapatkan profil pengguna aktif berdasarkan JWT token.       |

## Prediksi Nasabah

| Endpoint          | Body Request                                                                                                            | Response                                                                                                                                                | Keterangan                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **POST /predict** | JSON berisi fitur nasabah seperti:<br>`age`: number,<br>`job`: string,<br>`marital`: string,<br>`balance`: number, dll. | **status code:** 200 (OK)<br>**body:**<br>{<br>"status": "success",<br>"data": {<br>"probability": 0.82,<br>"predicted_class": "berlangganan"<br>}<br>} | Melakukan inferensi menggunakan model ONNX. Endpoint ini **memerlukan autentikasi JWT**. |

## Pengelolaan Data Nasabah
* mengelola data nasabah yang tersimpan di database SQLite.

| Endpoint               | Body Request                                                        | Response                                                                                                                                      | Keterangan                             |
| ---------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **POST /leads**        | `name`: string<br>`age`: number<br>`job`: string<br>`score`: number | **status code:** 201 (Created)<br>**body:**<br>{<br>"status": "success",<br>"message": "Lead added successfully",<br>"data": { "id": 1 }<br>} | Menambahkan data nasabah baru.         |
| **GET /get_leads**     | -                                                                   | **status code:** 200 (OK)<br>**body:**<br>{<br>"status": "success",<br>"data": [ {...}, {...} ]<br>}                                          | Mengambil seluruh data nasabah.        |
| **GET /leads/{id}**    | -                                                                   | **status code:** 200 (OK)<br>**body:**<br>{<br>"status": "success",<br>"data": { ... }<br>}                                                   | Mengambil data nasabah berdasarkan ID. |
| **PUT /leads/{id}**    | `name`: string<br>`age`: number<br>`job`: string<br>`score`: number | **status code:** 200 (OK)<br>**body:**<br>{<br>"status": "success",<br>"message": "Lead updated successfully"<br>}                            | Mengubah data nasabah berdasarkan ID.  |
| **DELETE /leads/{id}** | -                                                                   | **status code:** 200 (OK)<br>**body:**<br>{<br>"status": "success",<br>"message": "Lead deleted successfully"<br>}                            | Menghapus data nasabah berdasarkan ID. |
