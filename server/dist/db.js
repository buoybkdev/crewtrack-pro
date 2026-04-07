"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readDb = readDb;
exports.writeDb = writeDb;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_DIR = path_1.default.join(__dirname, '..', 'data');
const DB_FILE = path_1.default.join(DATA_DIR, 'db.json');
const seedData = {
    crew: [
        {
            id: '1',
            name: 'James Harrington',
            role: 'Captain',
            email: 'j.harrington@crewtrack.com',
            phone: '+1-555-0101',
            status: 'active',
            joinDate: '2019-03-15',
            notes: 'Senior captain with 15 years experience'
        },
        {
            id: '2',
            name: 'Maria Santos',
            role: 'First Officer',
            email: 'm.santos@crewtrack.com',
            phone: '+1-555-0102',
            status: 'active',
            joinDate: '2020-07-22',
            notes: 'Certified in advanced navigation'
        },
        {
            id: '3',
            name: 'Derek Okafor',
            role: 'Engineer',
            email: 'd.okafor@crewtrack.com',
            phone: '+1-555-0103',
            status: 'active',
            joinDate: '2021-01-10'
        },
        {
            id: '4',
            name: 'Sofia Lindqvist',
            role: 'Navigator',
            email: 's.lindqvist@crewtrack.com',
            phone: '+1-555-0104',
            status: 'on_leave',
            joinDate: '2020-11-05',
            notes: 'On maternity leave until March'
        },
        {
            id: '5',
            name: 'Tom Buchanan',
            role: 'Deckhand',
            email: 't.buchanan@crewtrack.com',
            phone: '+1-555-0105',
            status: 'active',
            joinDate: '2022-04-18'
        },
        {
            id: '6',
            name: 'Priya Nair',
            role: 'Medic',
            email: 'p.nair@crewtrack.com',
            phone: '+1-555-0106',
            status: 'unassigned',
            joinDate: '2021-09-30'
        },
        {
            id: '7',
            name: 'Carlos Vega',
            role: 'Cook',
            email: 'c.vega@crewtrack.com',
            phone: '+1-555-0107',
            status: 'active',
            joinDate: '2022-02-14'
        },
        {
            id: '8',
            name: 'Anna Kowalski',
            role: 'Mate',
            email: 'a.kowalski@crewtrack.com',
            phone: '+1-555-0108',
            status: 'inactive',
            joinDate: '2018-06-01',
            notes: 'Contract ended'
        }
    ],
    assignments: [
        {
            id: 'a1',
            crewMemberId: '1',
            vesselName: 'MV Northern Star',
            startDate: '2024-01-15',
            endDate: '2024-04-15',
            status: 'active',
            notes: 'North Atlantic route'
        },
        {
            id: 'a2',
            crewMemberId: '2',
            vesselName: 'MV Northern Star',
            startDate: '2024-01-15',
            endDate: '2024-04-15',
            status: 'active'
        },
        {
            id: 'a3',
            crewMemberId: '3',
            vesselName: 'SS Pacific Dawn',
            startDate: '2024-02-01',
            endDate: '2024-05-01',
            status: 'scheduled',
            notes: 'Engine overhaul duties'
        },
        {
            id: 'a4',
            crewMemberId: '5',
            vesselName: 'MV Ocean Horizon',
            startDate: '2023-10-01',
            endDate: '2024-01-01',
            status: 'completed'
        },
        {
            id: 'a5',
            crewMemberId: '7',
            vesselName: 'SS Pacific Dawn',
            startDate: '2024-02-01',
            endDate: '2024-05-01',
            status: 'scheduled'
        }
    ]
};
function ensureDataDir() {
    if (!fs_1.default.existsSync(DATA_DIR)) {
        fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
    }
}
function readDb() {
    ensureDataDir();
    if (!fs_1.default.existsSync(DB_FILE)) {
        writeDb(seedData);
        return seedData;
    }
    const raw = fs_1.default.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
}
function writeDb(data) {
    ensureDataDir();
    fs_1.default.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
