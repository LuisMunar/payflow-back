# payflow-back

Backend API for the Payflow credit card checkout challenge.

The API manages products, local transactions, card payment processing through a sandbox payment provider, stock updates and normalized transaction results for the mobile app.

## Stack

- Node.js
- TypeScript
- NestJS
- PostgreSQL
- Prisma
- Docker Compose
- Jest

## Requirements

- Docker and Docker Compose
- Node.js 24.16.0
- npm 11.13.0

The API and PostgreSQL run locally with Docker Compose. Node/npm are required to run tests, linting, Prisma commands and local tooling.

Use the project Node version with NVM:

```bash
nvm use
```

## Architecture

This API follows a pragmatic Hexagonal/Clean Architecture:

- `domain`: business entities, states and pure rules.
- `application`: use cases and orchestration.
- `infrastructure`: Prisma repositories, database access and payment gateway adapter.
- `interfaces`: controllers, request DTOs and response DTOs.

Main modules:

- `health`
- `products`
- `transactions`
- `payments`
- `prisma`
- `config`

## Environment

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Required variables:

```text
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://payflow:payflow@localhost:5432/payflow?schema=public
PAYMENT_API_BASE_URL=<sandbox-api-url>
PAYMENT_PUBLIC_KEY=<sandbox-public-key>
PAYMENT_PRIVATE_KEY=<sandbox-private-key>
PAYMENT_INTEGRITY_KEY=<sandbox-integrity-key>
```

When the API runs inside Docker Compose, the database URL is overridden to use the internal PostgreSQL service host:

```text
postgres:5432
```

## Local Setup

Install dependencies:

```bash
npm install
```

Start PostgreSQL and the API:

```bash
docker compose up -d --build
```

Apply migrations:

```bash
npm run prisma:deploy
```

Seed sample products:

```bash
npm run prisma:seed
```

The API runs at:

```text
http://localhost:3000
```

Check health:

```bash
curl http://localhost:3000/health
```

## Docker Commands

Start services:

```bash
docker compose up -d --build
```

Show service status:

```bash
docker compose ps
```

Show API logs:

```bash
docker compose logs -f api
```

Stop services:

```bash
docker compose down
```

Stop services and remove PostgreSQL volume:

```bash
docker compose down -v
```

## Available Scripts

```bash
npm run build
npm run lint
npm test
npm run test:cov
npm run prisma:generate
npm run prisma:deploy
npm run prisma:migrate
npm run prisma:seed
npm run prisma:studio
npm audit --audit-level=moderate
```

Recommended validation before opening a pull request:

```bash
npm run build
npm run lint
npm run test:cov
npm audit --audit-level=moderate
```

Coverage target: more than 80%.

## Database

Local Docker connection:

```text
Host: localhost
Port: 5432
Database: payflow
User: payflow
Password: payflow
```

## API Endpoints

```text
GET  /health
GET  /products
GET  /products/:id
POST /transactions
GET  /transactions/:id
POST /transactions/:id/payments/card
```

## Payment Flow

1. The mobile app requests the product catalog from this backend.
2. The mobile app creates a local transaction with selected items.
3. The backend validates product existence, quantities and stock.
4. The backend creates the local transaction in `PENDING`.
5. The mobile app sends card data to this backend for the pending transaction.
6. The backend tokenizes the card with the sandbox payment provider.
7. The backend creates the provider transaction using the card token and integrity signature.
8. The backend maps the provider status to the local transaction status.
9. The backend decrements product stock only when the final status is `APPROVED`.

The mobile app never calls the payment provider directly. Private and integrity keys remain only in the backend.

## API Examples

### Health

```bash
curl http://localhost:3000/health
```

### List Products

```bash
curl http://localhost:3000/products
```

### Get Product

```bash
curl http://localhost:3000/products/a5b95f3f-74ad-4f0d-9730-8b1f463a5a49
```

### Create Transaction

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

The backend calculates totals server-side. The mobile app must not send the final amount.

### Get Transaction

```bash
curl http://localhost:3000/transactions/<transaction-id>
```

### Process Card Payment

```bash
curl -X POST http://localhost:3000/transactions/<transaction-id>/payments/card \
  -H 'Content-Type: application/json' \
  -d '{
    "card": {
      "number": "4242424242424242",
      "expMonth": "12",
      "expYear": "30",
      "cvc": "123",
      "cardHolder": "Luis Munar"
    },
    "installments": 1
  }'
```

The API does not persist full card numbers or CVC values. It stores only non-sensitive payment metadata such as card brand, last four digits, gateway transaction id and gateway status.

## Transaction Statuses

```text
PENDING
APPROVED
DECLINED
ERROR
```

Stock rules:

- `PENDING`: stock is not decremented.
- `APPROVED`: stock is decremented transactionally.
- `DECLINED`: stock is not decremented.
- `ERROR`: stock is not decremented.

## Testing

Run unit tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:cov
```

The coverage report is generated at:

```text
coverage/lcov-report/index.html
```

## Security Notes

- Do not commit `.env`.
- Do not expose private keys to the mobile app.
- Do not log or persist full card numbers.
- Do not log or persist CVC values.
- The backend calculates transaction totals from database products.
- Product stock is decremented only after approved payments.
