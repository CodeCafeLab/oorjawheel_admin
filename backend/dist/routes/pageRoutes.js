import { Router } from 'express';
import { listPages, addPage, getPage, editPage, removePage } from '../controllers/pageController.js';
const router = Router();
router.get('/', listPages);
router.post('/', addPage);
router.get('/:id', getPage);
router.put('/:id', editPage);
router.delete('/:id', removePage);
export default router;
