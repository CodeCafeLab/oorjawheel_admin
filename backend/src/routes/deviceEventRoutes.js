import { Router } from 'express';
import { listDeviceEvents, addDeviceEvent } from '../controllers/deviceEventController.js';

const router = Router();

router.get('/', listDeviceEvents);
router.post('/', addDeviceEvent);

export default router;
