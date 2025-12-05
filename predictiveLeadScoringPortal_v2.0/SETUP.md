# Setup Guide

## Prerequisites

- Node.js v14++
- PostgreSQL v12++
- npm atau yarn

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

1. Buat database PostgreSQL:
```sql
CREATE DATABASE lead_scoring_db;
```

2. Copy `.env.example` ke `.env`:
```bash
cp .env.example .env
```

3. Edit `.env` dan sesuaikan konfigurasi database:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lead_scoring_db
DB_USER=postgres
DB_PASSWORD=your_password
```

### 3. Run Migrations

```bash
npm run migrate:up
```

Ini akan membuat semua tabel yang diperlukan:
- users
- leads
- lead_features
- lead_scores
- lead_outcomes
- refresh_tokens

### 4. Place ONNX Model

Letakkan file model ONNX Anda di:
```
src/model/model.onnx
```

Penting: Pastikan format input model sesuai dengan `ModelService.prepareFeatureVector()`. Jika berbeda, sesuaikan encoding functions di `src/services/ModelService.js`.

### 5. Create Admin User (Optional)

Anda bisa membuat user admin pertama melalui API:

```bash
POST /api/auth/register
{
  "username": "admin",
  "email": "admin@bank.com",
  "password": "secure_password",
  "full_name": "Administrator",
  "role": "admin"
}
```

### 6. Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:3000` (atau port yang dikonfigurasi di `.env`).

## Testing API

### 1. Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "sales1",
    "email": "sales1@bank.com",
    "password": "password123",
    "full_name": "Sales Person 1",
    "role": "sales"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "sales1",
    "password": "password123"
  }'
```

### 3. Create Lead
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "customer_id": "CUST001",
    "age": 45,
    "job": "management",
    "marital": "married",
    "education": "university.degree",
    "default_credit": false,
    "balance": 1000.50,
    "housing_loan": true,
    "personal_loan": false
  }'
```

### 4. Calculate Score
```bash
curl -X POST http://localhost:3000/api/scoring/calculate/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Get Ranked Leads
```bash
curl -X GET http://localhost:3000/api/ranking?limit=10 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

### Database Connection Error
- Pastikan PostgreSQL berjalan
- Periksa kredensial di `.env`
- Pastikan database sudah dibuat

### Model Not Found Error
- Pastikan file `src/model/model.onnx` ada
- Periksa path file model

### Migration Error
- Pastikan database sudah dibuat
- Periksa koneksi database
- Hapus tabel `pgmigrations` jika perlu reset migrations

### Port Already in Use
- Ubah `PORT` di `.env`
- Atau hentikan proses yang menggunakan port tersebut

## Production Deployment

1. Set `NODE_ENV=production` di `.env`
2. Gunakan secret keys yang kuat untuk JWT
3. Setup HTTPS/SSL
4. Konfigurasi CORS dengan domain yang spesifik
5. Setup database connection pooling yang sesuai
6. Enable logging dan monitoring
7. Setup backup database secara berkala