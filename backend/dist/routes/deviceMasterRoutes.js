import { Router } from 'express';
import { listDeviceMasters, addDeviceMaster, getDeviceMaster, editDeviceMaster, removeDeviceMaster } from '../controllers/deviceMasterController.js';
const router = Router();
router.get('/', listDeviceMasters);
router.post('/', addDeviceMaster);
router.get('/:id', getDeviceMaster);
router.put('/:id', editDeviceMaster);
router.delete('/:id', removeDeviceMaster);
export default router;
