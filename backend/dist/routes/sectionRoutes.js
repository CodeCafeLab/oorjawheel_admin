import { Router } from 'express';
import { listSections, addSection, getSection, editSection, removeSection } from '../controllers/sectionController.js';
const router = Router();
router.get('/', listSections);
router.post('/', addSection);
router.get('/:id', getSection);
router.put('/:id', editSection);
router.delete('/:id', removeSection);
export default router;
