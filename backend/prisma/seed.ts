import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const count = await prisma.availabilityRule.count();
  if (count > 0) return;

  await prisma.availabilityRule.createMany({
    data: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', slotMinutes: 30 },
      { dayOfWeek: 1, startTime: '14:00', endTime: '18:00', slotMinutes: 30 },
      { dayOfWeek: 2, startTime: '09:00', endTime: '13:00', slotMinutes: 30 },
      { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', slotMinutes: 30 },
      { dayOfWeek: 5, startTime: '09:00', endTime: '12:00', slotMinutes: 30 }
    ]
  });
}

main()
  .then(() => console.log('Seed terminé.'))
  .finally(() => prisma.$disconnect());
