"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    const db = (0, db_1.readDb)();
    const { status } = req.query;
    let crew = db.crew;
    if (status && typeof status === 'string') {
        crew = crew.filter((c) => c.status === status);
    }
    res.json(crew);
});
router.post('/', (req, res) => {
    const db = (0, db_1.readDb)();
    const body = req.body;
    const newMember = {
        id: (0, uuid_1.v4)(),
        name: body.name,
        role: body.role,
        email: body.email,
        phone: body.phone,
        status: body.status || 'unassigned',
        joinDate: body.joinDate || new Date().toISOString().split('T')[0],
        notes: body.notes,
    };
    db.crew.push(newMember);
    (0, db_1.writeDb)(db);
    res.status(201).json(newMember);
});
router.put('/:id', (req, res) => {
    const db = (0, db_1.readDb)();
    const index = db.crew.findIndex((c) => c.id === req.params.id);
    if (index === -1) {
        res.status(404).json({ error: 'Crew member not found' });
        return;
    }
    db.crew[index] = { ...db.crew[index], ...req.body, id: req.params.id };
    (0, db_1.writeDb)(db);
    res.json(db.crew[index]);
});
router.delete('/:id', (req, res) => {
    const db = (0, db_1.readDb)();
    const index = db.crew.findIndex((c) => c.id === req.params.id);
    if (index === -1) {
        res.status(404).json({ error: 'Crew member not found' });
        return;
    }
    db.crew.splice(index, 1);
    (0, db_1.writeDb)(db);
    res.status(204).send();
});
exports.default = router;
