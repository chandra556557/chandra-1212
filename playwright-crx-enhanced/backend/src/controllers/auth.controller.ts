import { Request, Response } from 'express';
import { authService } from '../services/auth/auth.service';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class AuthController {
  /**
   * Register a new user
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    try {
      const result = await authService.register(email, password, name);

      return res.status(201).json(result);
    } catch (error: any) {
      logger.error('Registration error:', error);

      if (error.message.includes('already exists')) {
        return res.status(409).json({ error: error.message });
      }

      return res.status(400).json({ error: error.message });
    }
  });

  /**
   * Login user
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const result = await authService.login(email, password);

      return res.json(result);
    } catch (error: any) {
      logger.error('Login error:', error);

      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: error.message });
      }

      return res.status(400).json({ error: error.message });
    }
  });

  /**
   * Refresh access token
   */
  refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    try {
      const result = await authService.refreshAccessToken(refreshToken);

      return res.json(result);
    } catch (error: any) {
      logger.error('Token refresh error:', error);
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
  });

  /**
   * Logout user
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    try {
      await authService.logout(refreshToken);

      return res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
      logger.error('Logout error:', error);
      return res.status(400).json({ error: error.message });
    }
  });
}
