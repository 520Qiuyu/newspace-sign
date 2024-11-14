import express from 'express';
import { getLogs, renderLogsPage } from '../controllers/logs.js';

const router = express.Router();

router.get('/', renderLogsPage);
router.get('/api/logs', getLogs);

export default router; 