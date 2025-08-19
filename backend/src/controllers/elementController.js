import {
    getElements,
    createElement,
    getElementById,
    updateElement,
    deleteElement
  } from '../models/elementModel.js';
  
  export async function listElements(req, res, next) {
    try {
      const sectionId = req.query.section_id;
      const rows = await getElements(sectionId);
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
  
  export async function addElement(req, res, next) {
    try {
      const body = req.body;
      if (!body.section_id || !body.type || !body.label) {
        return res.status(400).json({ error: 'section_id, type, and label are required' });
      }
      const result = await createElement(body);
      res.status(201).json({ message: 'Created', id: result.id });
    } catch (err) {
      next(err);
    }
  }
  
  export async function getElement(req, res, next) {
    try {
      const element = await getElementById(req.params.id);
      if (!element) return res.status(404).json({ error: 'Not found' });
      res.json(element);
    } catch (err) {
      next(err);
    }
  }
  
  export async function editElement(req, res, next) {
    try {
      await updateElement(req.params.id, req.body);
      res.json({ message: 'Updated' });
    } catch (err) {
      next(err);
    }
  }
  
  export async function removeElement(req, res, next) {
    try {
      await deleteElement(req.params.id);
      res.json({ message: 'Deleted' });
    } catch (err) {
      next(err);
    }
  }
  