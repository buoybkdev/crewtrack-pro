import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readDb, writeDb } from '../db';
import { CrewMember } from '../types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const db = readDb();
  const { status } = req.query;
  let crew = db.crew;
  if (status && typeof status === 'string') {
    crew = crew.filter((c) => c.status === status);
  }
  res.json(crew);
});

router.post('/', (req: Request, res: Response) => {
  const db = readDb();
  const body = req.body as Omit<CrewMember, 'id'>;
  const newMember: CrewMember = {
    id: uuidv4(),
    name: body.name,
    role: body.role,
    email: body.email,
    phone: body.phone,
    status: body.status || 'unassigned',
    joinDate: body.joinDate || new Date().toISOString().split('T')[0],
    notes: body.notes,
  };
  db.crew.push(newMember);
  writeDb(db);
  res.status(201).json(newMember);
});

router.put('/:id', (req: Request, res: Response) => {
  const db = readDb();
  const index = db.crew.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Crew member not found' });
    return;
  }
  db.crew[index] = { ...db.crew[index], ...req.body, id: req.params.id };
  writeDb(db);
  res.json(db.crew[index]);
});

router.delete('/:id', (req: Request, res: Response) => {
  const db = readDb();
  const index = db.crew.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Crew member not found' });
    return;
  }
  db.crew.splice(index, 1);
  writeDb(db);
  res.status(204).send();
});

export default router;
