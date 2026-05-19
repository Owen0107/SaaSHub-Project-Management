import { Router } from 'express';
import * as webhookController from '../controllers/webhookController.js';

const router = Router();

router.post('/github', webhookController.verifySignature, webhookController.handleGithubWebhook);

export default router;
