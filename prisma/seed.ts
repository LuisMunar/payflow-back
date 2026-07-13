import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to seed the database');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
  }),
});

const products = [
  {
    id: 'a5b95f3f-74ad-4f0d-9730-8b1f463a5a49',
    name: 'Wireless Keyboard',
    description: 'Compact mechanical keyboard with Bluetooth connectivity.',
    priceInCents: 18990000,
    currency: 'COP',
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
  },
  {
    id: 'b7e96536-a2f6-4d52-9137-c5cb2ccfb69a',
    name: 'Noise-Cancelling Headphones',
    description: 'Over-ear headphones with active noise cancellation.',
    priceInCents: 32990000,
    currency: 'COP',
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
  },
  {
    id: 'ff5d8843-03da-4a9e-a659-9f3ed908b77f',
    name: 'USB-C Docking Station',
    description: 'Multi-port dock with HDMI, ethernet, USB-A and USB-C power delivery.',
    priceInCents: 24990000,
    currency: 'COP',
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761',
  },
];

async function main(): Promise<void> {
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
