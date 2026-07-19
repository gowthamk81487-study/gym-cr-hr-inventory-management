import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { AuthController } from './controllers/authController';
import { ClientRepository } from './repositories/clientRepository';
import { authenticateJWT, requireRoles, AuthenticatedRequest } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 4000;

// Body Parsers & CORS Setup
app.use(cors());
app.use(express.json());

// Public Auth Endpoints
app.post('/api/v1/auth/login', AuthController.login);
app.post('/api/v1/auth/refresh', AuthController.refreshToken);

// Protected Roster & Client Pool Endpoints (RBAC rules matching plans)
app.get(
  '/api/v1/coaches/pool',
  authenticateJWT as any,
  requireRoles(['super_admin', 'manager', 'coach']) as any,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const pool = await ClientRepository.getAvailablePTClientPool();
      res.status(200).json({
        status: 200,
        message: 'Available PT client pool retrieved.',
        data: pool
      });
    } catch (err: any) {
      res.status(500).json({ status: 500, message: 'Failed to retrieve client pool.', error: err.message });
    }
  }
);

app.post(
  '/api/v1/clients/:id/claim',
  authenticateJWT as any,
  requireRoles(['super_admin', 'manager', 'coach']) as any,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { ptPackage } = req.body;
    const coachId = req.user?.entityId;

    if (!coachId) {
      return res.status(400).json({ status: 400, message: 'Coaching identity context is missing.' });
    }
    if (!ptPackage) {
      return res.status(400).json({ status: 400, message: 'Target PT package parameter is required.' });
    }

    try {
      const client = await ClientRepository.claimClient(id, coachId, ptPackage);
      res.status(200).json({
        status: 200,
        message: 'Client profile accepted and PT package assigned.',
        data: client
      });
    } catch (err: any) {
      res.status(500).json({ status: 500, message: 'Claim operations failed.', error: err.message });
    }
  }
);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    status: 500,
    message: 'Something went wrong inside the server infrastructure.',
    errors: { system: [err.message] }
  });
});

// App listener
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[THE GYM BACKEND] Server listening on: http://localhost:${PORT}`);
  });
}

export default app;
