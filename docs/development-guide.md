# Linkup — Development & Contribution Guide

This guide describes how to work with, develop, test, and run the applications in the Linkup repository.

## Prerequisites

- **Node.js**: v20+ or v24+
- **npm**: v10+
- **Docker & Docker Compose**: v24+ / Compose v2+
- **Git**: Installed and configured

## Environment Setup Workflow

Every project folder (`01-social-media-platform`, etc.) is fully self-contained.

```bash
# 1. Select the project to work on
cd 01-social-media-platform

# 2. Copy the environment configuration
cp .env.example .env

# 3. Start local containerized dependencies
docker compose up -d

# 4. Set up and start backend service
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run start:dev

# 5. Set up and start frontend client (new terminal)
cd ../frontend
npm install
npm run dev
```

## Running Tests

Each application includes automated test suites:

```bash
# Run unit & API integration tests
cd backend
npm test

# Run end-to-end tests
cd ../tests
npm test
```
