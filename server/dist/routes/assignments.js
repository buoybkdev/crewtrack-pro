"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    const db = (0, db_1.readDb)();
    const { crewId } = req.query;
    let assignments = db.assignments;
    if (crewId && typeof crewId === 'string') {
        assignments = assignments.filter((a) => a.crewMemberId === crewId);
    }
    res.json(assignments);
});
router.post('/', (req, res) => {
    const db = (0, db_1.readDb)();
    const body = req.body;
    const newAssignment = {
        id: (0, uuid_1.v4)(),
        crewMemberId: body.crewMemberId,
        vesselName: body.vesselName,
        startDate: body.startDate,
        endDate: body.endDate,
        status: body.status || 'scheduled',
        notes: body.notes,
    };
    db.assignments.push(newAssignment);
    (0, db_1.writeDb)(db);
    res.status(201).json(newAssignment);
});
router.put('/:id', (req, res) => {
    const db = (0, db_1.readDb)();
    const index = db.assignments.findIndex((a) => a.id === req.params.id);
    if (index === -1) {
        res.status(404).json({ error: 'Assignment not found' });
        return;
    }
    db.assignments[index] = { ...db.assignments[index], ...req.body, id: req.params.id };
    (0, db_1.writeDb)(db);
    res.json(db.assignments[index]);
});
router.delete('/:id', (req, res) => {
    const db = (0, db_1.readDb)();
    const index = db.assignments.findIndex((a) => a.id === req.params.id);
    if (index === -1) {
        res.status(404).json({ error: 'Assignment not found' });
        return;
    }
    db.assignments.splice(index, 1);
    (0, db_1.writeDb)(db);
    res.status(204).send();
});
exports.default = router;
