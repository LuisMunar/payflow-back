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

Copy `.env.example` to `.env` and fill local values.

Start the backend stack with Docker:

```bash
docker compose up -d --build
```

Run migrations and seed products when needed:

```bash
npm run prisma:deploy
npm run prisma:seed
```

The API runs at:

```text
http://localhost:3000
```

For local development outside Docker, install dependencies and start NestJS:

```bash
npm install
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
POST /transactions
GET /transactions/:id
```

Create a pending transaction:

```bash
curl -X POST http://localhost:3000/transactions \
  -H 'Content-Type: application/json' \
  -d '{
    "customerName": "Luis Munar",
    "customerEmail": "luis@example.com",
    "items": [
      {
        "productId": "a5b95f3f-74ad-4f0d-9730-8b1f463a5a49",
        "quantity": 2
      }
    ]
  }'
```

The backend validates stock and calculates totals server-side. Stock is not decremented when the transaction is created as `PENDING`; it must be decremented only after an approved payment.

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
