import { Router } from 'express';
import {
  listElements,
  addElement,
  getElement,
  editElement,
  removeElement
} from '../controllers/elementController.js';

const router = Router();

router.get('/', listElements);
router.post('/', addElement);
router.get('/:id', getElement);
router.put('/:id', editElement);
router.delete('/:id', removeElement);

export default router;
