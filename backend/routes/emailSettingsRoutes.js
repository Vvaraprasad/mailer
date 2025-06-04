import express from 'express';
import {
  getEmailSettings,
  updateEmailSettings,
} from '../controllers/emailSettingsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/settings/:userId', authMiddleware, getEmailSettings);
router.put('/settings/:userId', authMiddleware, updateEmailSettings);

export default router;
