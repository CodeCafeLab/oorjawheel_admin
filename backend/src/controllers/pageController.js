import {
    getPages,
    createPage,
    getPageById,
    updatePage,
    deletePage
  } from '../models/pageModel.js';
  
  export async function listPages(_req, res, next) {
    try {
      const rows = await getPages();
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
  
  export async function addPage(req, res, next) {
    try {
      const body = req.body;
      if (!body.title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      const result = await createPage(body);
      res.status(201).json({ message: 'Created', id: result.id });
    } catch (err) {
      next(err);
    }
  }
  
  export async function getPage(req, res, next) {
    try {
      const page = await getPageById(req.params.id);
      if (!page) return res.status(404).json({ error: 'Not found' });
      res.json(page);
    } catch (err) {
      next(err);
    }
  }
  
  export async function editPage(req, res, next) {
    try {
      await updatePage(req.params.id, req.body);
      res.json({ message: 'Updated' });
    } catch (err) {
      next(err);
    }
  }
  
  export async function removePage(req, res, next) {
    try {
      await deletePage(req.params.id);
      res.json({ message: 'Deleted' });
    } catch (err) {
      next(err);
    }
  }
  