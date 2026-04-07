"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const crew_1 = __importDefault(require("./routes/crew"));
const assignments_1 = __importDefault(require("./routes/assignments"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/crew', crew_1.default);
app.use('/api/assignments', assignments_1.default);
// Serve React app in production
const clientDist = path_1.default.join(__dirname, '..', '..', 'client', 'dist');
app.use(express_1.default.static(clientDist));
app.get('*', (_req, res) => {
    res.sendFile(path_1.default.join(clientDist, 'index.html'));
});
app.listen(PORT, () => {
    console.log(`CrewTrack Pro server running on port ${PORT}`);
});
