# Predictive Lead Scoring Portal for Banking Sales - Backend

Backend API untuk sistem Predictive Lead Scoring yang membantu tim sales perbankan dalam mengidentifikasi nasabah dengan potensi konversi tertinggi untuk produk deposito berjangka.

## Fitur

- **Authentication & Authorization**: JWT-based authentication dengan refresh token
- **Lead Management**: CRUD operations untuk data leads/nasabah
- **Predictive Scoring**: Scoring otomatis menggunakan model ML ONNX
- **Outcome Tracking**: Tracking hasil kampanye dan konversi
- **Ranking System**: Ranking leads berdasarkan score untuk prioritas kontak
- **Statistics**: Analytics dan statistik untuk monitoring performa

## Tech Stack

- **Node.js** dengan Express.js
- **PostgreSQL** sebagai database
- **ONNX Runtime** untuk inference model ML
- **JWT** untuk authentication
- **Joi** untuk validation
- **node-pg-migrate** untuk database migrations

## Struktur Project

```
predictive-lead-scoring-backend/
├── src/
│   ├── server.js              # Entry point
│   ├── app.js                 # Express app configuration
│   ├── api/                   # API routes, handlers, validators
│   ├── services/              # Business logic
│   ├── database/              # Migrations & queries
│   ├── model/                 # ONNX model file
│   ├── config/                # Configuration files
│   ├── middleware/            # Custom middleware
│   └── utils/                 # Utility functions
├── .env.example               # Environment variables template
└── package.json
```

## Installation

1. Clone repository
```bash
git clone <repository-url>
cd predictive-lead-scoring-backend
```

2. Install dependencies
```bash
npm install
```

3. Setup database
- Buat database PostgreSQL
- Copy `.env.example` ke `.env` dan sesuaikan konfigurasi database

4. Run migrations
```bash
npm run migrate:up
```

5. Place your ONNX model
- Letakkan file model ONNX di `src/model/model.onnx`

6. Start server
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

Lihat `.env.example` untuk daftar environment variables yang diperlukan.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Leads
- `GET /api/leads` - Get all leads (paginated)
- `GET /api/leads/:id` - Get lead by ID
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `GET /api/leads/status/:status` - Get leads by status

### Scoring
- `POST /api/scoring/calculate/:leadId` - Calculate score for a lead
- `POST /api/scoring/batch` - Calculate scores for multiple leads
- `GET /api/scoring/lead/:leadId` - Get score by lead ID
- `GET /api/scoring` - Get all scores (paginated)

### Outcomes
- `GET /api/outcomes` - Get all outcomes (paginated)
- `GET /api/outcomes/lead/:leadId` - Get outcome by lead ID
- `POST /api/outcomes` - Create outcome
- `PUT /api/outcomes/:id` - Update outcome
- `GET /api/outcomes/statistics` - Get outcomes statistics

### Ranking
- `GET /api/ranking` - Get ranked leads (paginated)
- `GET /api/ranking/top` - Get top N leads
- `GET /api/ranking/without-scores` - Get leads without scores
- `GET /api/ranking/distribution` - Get score distribution

## Database Migrations

```bash
# Run all pending migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down

# Create new migration
npm run migrate:create migration_name
```

## Model ML

Model ONNX harus ditempatkan di `src/model/model.onnx`. Model service akan:
- Load model saat pertama kali digunakan
- Prepare feature vector dari data lead
- Return probability score (0-1)

**Note**: Sesuaikan `ModelService.prepareFeatureVector()` dan encoding functions sesuai dengan format input model yang Anda gunakan.

## Authentication

API menggunakan JWT Bearer token. Include token di header:
```
Authorization: Bearer <access_token>
```

## Development

```bash
# Run with nodemon (auto-reload)
npm run dev
```
