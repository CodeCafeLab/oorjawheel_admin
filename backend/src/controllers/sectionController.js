import {
    getSections,
    createSection,
    getSectionById,
    updateSection,
    deleteSection
  } from '../models/sectionModel.js';
  
  export async function listSections(req, res, next) {
    try {
      const rows = await getSections(req.query.page_id);
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
  
  export async function addSection(req, res, next) {
    try {
      const body = req.body;
      if (!body.page_id || !body.title) {
        return res.status(400).json({ error: 'page_id and title are required' });
      }
      const result = await createSection(body);
      res.status(201).json({ message: 'Created', id: result.id });
    } catch (err) {
      next(err);
    }
  }
  
  export async function getSection(req, res, next) {
    try {
      const section = await getSectionById(req.params.id);
      if (!section) return res.status(404).json({ error: 'Not found' });
      res.json(section);
    } catch (err) {
      next(err);
    }
  }
  
  export async function editSection(req, res, next) {
    try {
      await updateSection(req.params.id, req.body);
      res.json({ message: 'Updated' });
    } catch (err) {
      next(err);
    }
  }
  
  export async function removeSection(req, res, next) {
    try {
      await deleteSection(req.params.id);
      res.json({ message: 'Deleted' });
    } catch (err) {
      next(err);
    }
  }
  