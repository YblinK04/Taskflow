import { Client, neonConfig} from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

// Важно для Node.js окружения
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;

// 1. Создаем пул соединений Neon
const client = new Client(connectionString); 

// 2. Создаем адаптер
const adapter = new PrismaNeon(client); ;

// 3. Передаем адаптер в клиент
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;