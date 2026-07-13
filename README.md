# payflow-back

Backend API for the Payflow credit card checkout challenge.

## Stack

- Node.js
- TypeScript
- NestJS
- PostgreSQL
- Prisma
- Docker
- Jest

## Architecture

This API follows a pragmatic Hexagonal/Clean Architecture:

- `domain`: business rules, entities, value objects and transaction states.
- `application`: use cases and ports.
- `infrastructure`: Prisma, database repositories, payment gateway client and configuration.
- `interfaces`: controllers, DTOs and HTTP response mapping.

## Local Setup

Install dependencies:

```bash
npm install
```

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Run migrations and seed products:

```bash
npm run prisma:deploy
npm run prisma:seed
```

Start the API:

```bash
npm run start:dev
```

## Tests

Expected commands:

```bash
npm test
npm run test:cov
```

Coverage target: more than 80%.

## Endpoints

```text
GET /health
GET /products
GET /products/:id
```

## Database

Local Docker connection:

```text
Host: localhost
Port: 5432
Database: payflow
User: payflow
Password: payflow
```

When the API runs inside Docker Compose, it connects to PostgreSQL through the internal service host:

```text
postgres:5432
```

## Environment

Copy `.env.example` to `.env` and fill local values.

Do not commit real credentials, private keys or sandbox secrets.

## Git Workflow

Work by feature branches and pull requests.

Recommended first branches:

- `feature/back-project-setup`
- `feature/back-docker-postgres`
- `feature/back-prisma-products`
- `feature/back-transactions`
- `feature/back-payment-gateway`
- `feature/back-tests-coverage`
- `feature/back-readme`
