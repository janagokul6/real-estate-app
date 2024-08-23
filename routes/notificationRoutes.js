import express from 'express';
import { createNotification, getAgentNotifications ,markNotificationAsRead,
    getUnreadNotificationCount } from '../controller/notificationController.js';

const router = express.Router();

router.post('/create', createNotification);
router.get('/agent/:agentId', getAgentNotifications);
router.patch('/:notificationId/read', markNotificationAsRead);
router.get('/agent/:agentId/unread-count', getUnreadNotificationCount);

export default router;