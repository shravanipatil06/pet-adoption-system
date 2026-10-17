# 🐾 Pet Haven — Full-Stack Pet Adoption System

[![CI Pipeline](https://github.com/shravanipatil06/pet-adoption-system/actions/workflows/ci.yml/badge.svg)](https://github.com/shravanipatil06/pet-adoption-system/actions/workflows/ci.yml)

Pet Haven is a full-stack pet adoption platform built with React, Node.js/Express, MongoDB, and Socket.io.

## 🚀 CI/CD & Deployment Architecture (Experiment 9)

- **Continuous Integration (CI):** [GitHub Actions (`.github/workflows/ci.yml`)](.github/workflows/ci.yml) triggers on every push and pull request to `main`:
  - MongoDB 7.0 containerized service initialization.
  - Automated database seeding & pre-flight checks (`scratch/seed_admin.js`).
  - Backend server startup and `/` health check validation.
  - Experiment 7 REST API automated test suite (`scratch/validate_exp7_suite.js`).
  - Experiment 8 WebSocket real-time event test suite (`scratch/test_experiment_8_websockets.js`).
  - Vite frontend production build check (`npm run build`).
- **Frontend Continuous Deployment (CD):** Hosted on **Vercel** with automated production deployments from the `main` branch.
- **Backend Continuous Deployment (CD):** Hosted on **Render** (Web Service) with Auto-Deploy enabled on commit to the `main` branch.

---

## 💻 Local Development

Verified npm scripts from `package.json`:

```bash
# 1. Install dependencies
npm install

# 2. Run frontend and backend concurrently
npm run dev:full

# Or run individual services separately:
npm run dev      # Vite frontend dev server (http://localhost:5173)
npm run server   # Express backend with nodemon (http://localhost:5000)

# 3. Production build
npm run build    # Vite production bundle
```
