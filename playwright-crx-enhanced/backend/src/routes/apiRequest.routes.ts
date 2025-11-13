import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getApiRequests,
  getApiRequest,
  createApiRequest,
  updateApiRequest,
  deleteApiRequest
} from '../controllers/apiRequest.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getApiRequests);
router.get('/:id', getApiRequest);
router.post('/', createApiRequest);
router.put('/:id', updateApiRequest);
router.delete('/:id', deleteApiRequest);

export default router;
