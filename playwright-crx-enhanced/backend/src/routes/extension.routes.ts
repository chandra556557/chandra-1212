import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  handshake,
  heartbeat,
  saveScriptFromExtension,
  getConfigForExtension,
  postExtensionLogs
} from '../controllers/extension.controller';

const router = Router();

// Simple ping endpoint for extension connectivity checks
router.get('/ping', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Extension handshake to get server info and capabilities
router.post('/handshake', handshake);

// Extension heartbeat to keep connectivity and report basic info
router.post('/heartbeat', heartbeat);

// Get config for the extension (supported languages, defaults, limits)
router.get('/config', getConfigForExtension);

// Post logs from extension (non-authenticated)
router.post('/logs', postExtensionLogs);

// Save a script from the extension (requires auth)
router.post('/save-script', authMiddleware, saveScriptFromExtension);

export default router;
