# Repository Overview — Linkup

Linkup is an open-source mono-repository of 10 autonomous, production-ready applications within social networking, interpersonal communication, media distribution, and creative graphics.

## Mission and Scope

Rather than building a single monolithic system with multiple sub-modules, Linkup provides 10 completely independent, fully functioning systems. Each system is designed to demonstrate best-in-class software architecture, domain modeling, clean API design, end-to-end type safety, robust authorization boundaries, and thorough test suites.

## Repository Layout

Each project directory `NN-project-name` is organized with the following standard topology:

```text
NN-project-name/
  ├── frontend/         # Next.js / React application with Tailwind CSS and responsive UI
  ├── backend/          # NestJS / Node.js API service with modular architecture
  ├── database/         # Prisma schema, migrations, and realistic seed data
  ├── tests/            # Integration, security, and end-to-end test suites
  ├── docs/             # Technical specifications, API schema, architecture, and completion report
  ├── docker-compose.yml# Container definitions for Postgres, Redis, and local services
  ├── .env.example      # Documented environment configuration template
  └── README.md         # Comprehensive setup and operational runbook
```

## Quality and Verification Standards

1. **Independent Lifecycle**: Each application can be cloned, built, and executed in complete isolation without running any other application in the repository.
2. **Dedicated Persistence**: Each application operates against its own dedicated database instance and schema.
3. **Verified Deliverables**: Automated tests covering unit logic, cross-user authorization, API endpoints, and critical user journeys must pass before any phase is marked complete.
