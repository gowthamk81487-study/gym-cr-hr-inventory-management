import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_gym_erp_token';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_token';

export class AuthController {
  /**
   * Performs user credentials validation and JWT token issuance
   */
  public static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        message: 'Email and password are required.'
      });
    }

    try {
      const account = await prisma.account.findUnique({
        where: { email: email.toLowerCase() },
        include: { role: true, clientProfile: true, coachProfile: true }
      });

      if (!account) {
        return res.status(401).json({
          status: 401,
          message: 'Invalid credentials. Access denied.'
        });
      }

      // Password comparison (simulating hashing comparison in prod)
      if (account.passwordHash !== password) {
        return res.status(401).json({
          status: 401,
          message: 'Invalid credentials. Access denied.'
        });
      }

      if (account.status === 'suspended') {
        return res.status(403).json({
          status: 403,
          message: 'Account suspended. Contact system administrator.'
        });
      }

      // Resolve entityId
      const entityId = account.clientProfile?.id || account.coachProfile?.id;

      // Issue Access JWT
      const accessToken = jwt.sign(
        {
          id: account.id,
          email: account.email,
          role: account.role.name,
          entityId
        },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      // Issue Refresh Token
      const refreshToken = jwt.sign(
        { id: account.id },
        REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      // Log audit action
      await prisma.auditLog.create({
        data: {
          accountId: account.id,
          action: 'USER_LOGIN',
          details: `Successful login from ${email}`
        }
      });

      res.status(200).json({
        status: 200,
        message: 'Authentication successful.',
        data: {
          accessToken,
          refreshToken,
          user: {
            email: account.email,
            role: account.role.name,
            entityId
          }
        }
      });

    } catch (err: any) {
      res.status(500).json({
        status: 500,
        message: 'Internal server error during authentication.',
        errors: { server: [err.message] }
      });
    }
  }

  /**
   * Refreshes access tokens using a valid refresh token
   */
  public static async refreshToken(req: Request, res: Response) {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ status: 400, message: 'Refresh token required.' });
    }

    try {
      jwt.verify(token, REFRESH_SECRET, async (err: any, decoded: any) => {
        if (err) {
          return res.status(403).json({ status: 403, message: 'Invalid refresh token.' });
        }

        const account = await prisma.account.findUnique({
          where: { id: decoded.id },
          include: { role: true, clientProfile: true, coachProfile: true }
        });

        if (!account || account.status === 'suspended') {
          return res.status(403).json({ status: 403, message: 'User suspended or not found.' });
        }

        const entityId = account.clientProfile?.id || account.coachProfile?.id;

        const newAccessToken = jwt.sign(
          {
            id: account.id,
            email: account.email,
            role: account.role.name,
            entityId
          },
          JWT_SECRET,
          { expiresIn: '15m' }
        );

        res.status(200).json({
          status: 200,
          message: 'Access token refreshed.',
          data: { accessToken: newAccessToken }
        });
      });
    } catch (err: any) {
      res.status(500).json({ status: 500, message: 'Server error during token refresh.' });
    }
  }
}
export default AuthController;
