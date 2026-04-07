import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readDb, writeDb } from '../db';
import { Assignment } from '../types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const db = readDb();
  const { crewId } = req.query;
  let assignments = db.assignments;
  if (crewId && typeof crewId === 'string') {
    assignments = assignments.filter((a) => a.crewMemberId === crewId);
  }
  res.json(assignments);
});

router.post('/', (req: Request, res: Response) => {
  const db = readDb();
  const body = req.body as Omit<Assignment, 'id'>;
  const newAssignment: Assignment = {
    id: uuidv4(),
    crewMemberId: body.crewMemberId,
    vesselName: body.vesselName,
    startDate: body.startDate,
    endDate: body.endDate,
    status: body.status || 'scheduled',
    notes: body.notes,
  };
  db.assignments.push(newAssignment);
  writeDb(db);
  res.status(201).json(newAssignment);
});

router.put('/:id', (req: Request, res: Response) => {
  const db = readDb();
  const index = db.assignments.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }
  db.assignments[index] = { ...db.assignments[index], ...req.body, id: req.params.id };
  writeDb(db);
  res.json(db.assignments[index]);
});

router.delete('/:id', (req: Request, res: Response) => {
  const db = readDb();
  const index = db.assignments.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }
  db.assignments.splice(index, 1);
  writeDb(db);
  res.status(204).send();
});

export default router;
