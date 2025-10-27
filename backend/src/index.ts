import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { userRouter } from './routes/user';
import { blogRouter } from './routes/blog';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/user', userRouter);
app.use('/api/v1/blog', blogRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Health check endpoint with database test
app.get('/health', async (req, res) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL,
    });
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.log('Database health check failed:', error);
    res.status(503).json({ 
      status: 'Error', 
      database: 'Disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
