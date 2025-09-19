import { Router } from 'express';
import { listDevices, addDevice, getDevice, editDevice, removeDevice } from '../controllers/deviceController.js';
const router = Router();
router.get('/', listDevices);
router.post('/', addDevice);
router.get('/:id', getDevice);
router.put('/:id', editDevice);
router.delete('/:id', removeDevice);
export default router;
