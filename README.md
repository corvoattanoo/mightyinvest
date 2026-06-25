<div align="center">

<h1>MightyInvest</h1>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=20&pause=1000&color=58A6FF&center=true&vCenter=true&width=600&lines=Stock+Analytics+%7C+AI-Powered+%7C+SaaS;Real-time+market+data+%26+sentiment+tracking;Built+solo+%E2%80%94+from+zero+to+production" alt="Typing SVG" />

<p>A full-stack SaaS platform for retail stock investors — powered by AI chart analysis, real-time market data, and Reddit sentiment tracking.</p>

<p>
  <a href="https://mightyinvest.online"><img src="https://img.shields.io/badge/🌐 Live Demo-mightyinvest.online-58A6FF?style=for-the-badge" /></a>
  <img src="https://img.shields.io/badge/Laravel_12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" />
  <img src="https://img.shields.io/badge/Angular_19-DD0031?style=for-the-badge&logo=angular&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/AWS_EC2-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white" />
</p>

</div>

---

## 📸 Demo



https://github.com/user-attachments/assets/b6db1edd-f7fb-4dd2-bfc5-c3cfa3be3ca3







---

## 🧭 Overview

MightyInvest is a **production-deployed SaaS application** built solo from scratch — from architecture decisions to AWS deployment. It combines live market data, AI-powered chart analysis, and community sentiment tracking into a single platform for retail investors.

- 🔗 **Live at:** [mightyinvest.online](https://mightyinvest.online)
- 👤 **Built by:** [Yigit Efe Sözer](https://linkedin.com/in/yigit-efe-sozer) — solo, end-to-end
- 🗓️ **Status:** Active · Production

---

## ✨ Features

### 🆓 Free Tier
- Stock search & basic quote data
- Markets overview (top movers, indices)
- Account registration with email verification & 2FA/OTP login

### 💎 Pro Tier (Stripe Subscription)
- **AI Chart Analysis** — upload any chart image, get GPT-level analysis via Claude Vision API
- **Reddit Sentiment Tracker** — real-time community sentiment per ticker, scraped via Cloudflare Workers
- **Advanced Market Data** — extended historical data, volume analysis via Polygon.io
- **Watchlist & Alerts** — personalised stock tracking

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                               │
│                  Angular 19 (SPA)                           │
│            Tailwind CSS · TypeScript                        │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP (REST API)
┌─────────────────────▼───────────────────────────────────────┐
│                    API SERVER                               │
│              Laravel 12 (PHP 8.3)                           │
│   Sanctum Auth · Service Layer · Controller–Service         │
│         Redis Cache · Queue Workers                         │
└────┬──────────────┬──────────────┬──────────────────────────┘
     │              │              │
┌────▼────┐  ┌──────▼──────┐  ┌───▼────────────────────────┐
│PostgreSQL│  │    Redis     │  │     External APIs          │
│  (main  │  │  (cache +    │  │  Finnhub · Polygon.io      │
│   DB)   │  │   sessions)  │  │  Claude Vision · Stripe    │
└─────────┘  └─────────────┘  └───────────────┬────────────┘
                                               │
                                  ┌────────────▼───────────┐
                                  │  Cloudflare Workers    │
                                  │  (Reddit Proxy Layer)  │
                                  └────────────────────────┘

Deployment: AWS EC2 · Docker Compose · Nginx · AWS S3
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Angular 19, TypeScript, Tailwind CSS |
| **Backend** | Laravel 12, PHP 8.3 |
| **Database** | PostgreSQL (primary), Redis (cache & sessions) |
| **Auth** | Laravel Sanctum, 2FA/OTP, Email Verification |
| **Payments** | Stripe, Laravel Cashier (subscription + freemium gating) |
| **AI** | Claude Vision API (chart analysis) |
| **Market Data** | Finnhub API, Polygon.io |
| **Scraping** | Cloudflare Workers (Reddit proxy, bypasses AWS IP blocks) |
| **Storage** | AWS S3 (eu-north-1) |
| **Deployment** | AWS EC2, Docker Compose, Nginx |
| **CI/CD** | GitHub Actions |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/register` | Register new user | ❌ |
| `POST` | `/api/login` | Login + OTP trigger | ❌ |
| `POST` | `/api/verify-otp` | Verify 2FA OTP code | ❌ |
| `POST` | `/api/logout` | Invalidate token | ✅ |
| `GET` | `/api/user` | Get authenticated user | ✅ |

### Market Data
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/stocks/search?q={query}` | Search stocks by ticker/name | ✅ |
| `GET` | `/api/stocks/{symbol}/quote` | Real-time quote | ✅ |
| `GET` | `/api/stocks/{symbol}/history` | Historical OHLCV data | ✅ Pro |
| `GET` | `/api/markets/movers` | Top gainers & losers | ✅ |

### AI & Sentiment
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/ai/analyze-chart` | Upload chart → AI analysis | ✅ Pro |
| `GET` | `/api/sentiment/{symbol}` | Reddit sentiment score | ✅ Pro |

### Subscription
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/subscription/checkout` | Create Stripe checkout session | ✅ |
| `POST` | `/api/subscription/cancel` | Cancel active subscription | ✅ |
| `GET` | `/api/subscription/status` | Get current plan | ✅ |
| `POST` | `/api/webhooks/stripe` | Stripe webhook handler | ❌ |

---

## 🚀 Local Setup

### Prerequisites
- Docker & Docker Compose
- Git

### 1. Clone & Configure

```bash
git clone https://github.com/corvoattanoo/mightyinvest.git
cd mightyinvest
cp .env.example .env
```

### 2. Fill in `.env`

```env
# Database
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=mightyinvest
DB_USERNAME=postgres
DB_PASSWORD=your_password

# External APIs
FINNHUB_API_KEY=your_key
POLYGON_API_KEY=your_key
ANTHROPIC_API_KEY=your_key

# Stripe
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_DEFAULT_REGION=eu-north-1
AWS_BUCKET=mightyinvests3
```

### 3. Start with Docker

```bash
docker compose up -d --build
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
docker compose exec app php artisan storage:link
```

### 4. Frontend

```bash
cd frontend
npm install
ng serve
```

App runs at → `http://localhost:4200`
API runs at → `http://localhost:8000`

---

## 📁 Project Structure

```
mightyinvest/
├── app/
│   ├── Http/Controllers/     # Thin controllers
│   ├── Services/             # Business logic layer
│   │   ├── StockService.php
│   │   ├── SentimentAnalyzerService.php
│   │   ├── SocialScraperService.php
│   │   └── AIChartService.php
│   └── Models/
├── routes/api.php
├── docker-compose.yml
├── nginx/
└── frontend/                 # Angular 19 app
    └── src/app/
        ├── features/
        ├── core/
        └── shared/
```

---

## 📄 License

This project is open source under the [MIT License](LICENSE).

---

<div align="center">

Built with ☕ by [Yigit Efe Sözer](https://linkedin.com/in/yigit-efe-sozer) · [mightyinvest.online](https://mightyinvest.online)

</div>
