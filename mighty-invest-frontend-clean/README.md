# 🚀 Mighty Invest - Real-Time Market Intelligence & Portfolio Tracker

Mighty Invest is a high-performance, full-stack fintech application designed to provide investors with real-time market data and social-driven insights. Built with a modern **Angular** frontend and a robust **Laravel** backend, the platform features a custom-built **Reddit Sentiment Engine** that analyzes social signals to detect market trends before they hit the mainstream.

---

## 🌟 Key Features

- **⚡ Real-Time Ticker:** Live market prices fetched via high-concurrency background jobs and served through an optimized API.
- **🧠 Intelligence Engine:** A custom Reddit Scraper and NLP-based Sentiment Analyzer that monitors `r/wallstreetbets`, `r/stocks`, and `r/investing` for high-conviction trade signals.
- **📊 Advanced Portfolio Management:** Track holdings, visualize performance charts, and manage virtual balances (Demo mode includes $100k starter capital).
- **🌗 Modern UI/UX:** Responsive, dark-themed dashboard built with professional aesthetics, featuring dynamic loading states and smooth transitions.
- **🐳 Dockerized Architecture:** Fully containerized environment ensuring seamless deployment across any infrastructure.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** Angular 17+
- **Styling:** Vanilla CSS3 (Custom Design System) & TailwindCSS
- **State Management:** Reactive programming with RxJS
- **Icons:** Material Icons Round

### **Backend**
- **Framework:** Laravel 11 (PHP 8.2+)
- **Database:** PostgreSQL
- **Caching:** Redis
- **Task Scheduling:** Laravel Cron Jobs (Reddit Scraping & Price Refreshing)

### **Infrastructure & DevOps**
- **Cloud:** AWS EC2
- **Web Server:** Nginx (Reverse Proxy)
- **Containerization:** Docker & Docker Compose

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/corvoattanoo/mightyinvest.git
   cd mightyinvest
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example .env
   # Update your FINNHUB_API_KEY and DB credentials in .env
   ```

3. **Launch with Docker:**
   ```bash
   docker-compose up -d --build
   ```

4. **Initialize Database:**
   ```bash
   docker-compose exec app php artisan migrate --seed
   ```

5. **Start Intelligence Engine:**
   ```bash
   docker-compose exec app php artisan scrape:reddit
   ```

---

## 👨‍💻 Developer Notes

This project was built to demonstrate proficiency in **architecting scalable systems**, **integrating third-party APIs**, and **implementing automated data pipelines**. The sentiment analysis algorithm uses a weighted engagement model to filter noise and prioritize high-impact social signals.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---
**Developed by Yigit**  
*Available for Full-Stack / Backend opportunities.*