import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK',
    message: '🏟️ Backend de Canchas funcionando!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req: Request, res: Response) => {
  res.json({ 
    data: 'Conexión exitosa desde el frontend',
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});