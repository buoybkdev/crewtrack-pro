import express from 'express';
import cors from 'cors';
import path from 'path';
import crewRouter from './routes/crew';
import assignmentsRouter from './routes/assignments';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/crew', crewRouter);
app.use('/api/assignments', assignmentsRouter);

// Serve React app in production
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`CrewTrack Pro server running on port ${PORT}`);
});
