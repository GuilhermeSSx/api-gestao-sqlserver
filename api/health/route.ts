import { Request, Response, Router } from 'express'; // Importa os tipos do Express
import { prisma } from "../../lib/prisma"; // Ajuste o caminho para onde você instanciou o Prisma Client

const router = Router();

// Usamos "_" no req para indicar ao TS que sabemos que não estamos usando ele
router.get('/health', async (_req: Request, res: Response) => {
  try {
    // Tenta uma consulta simples no banco para ver se a conexão está viva
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).send('OK');
  } catch (error) {
    console.error("Healthcheck failed:", error);
    // Se o banco cair, a API responde erro e o Coolify entende como "Unhealthy"
    res.status(500).send('Database connection failed');
  }
});

export default router;