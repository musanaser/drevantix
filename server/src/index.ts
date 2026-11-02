import cors from 'cors';
import express from 'express';
import { existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createApi } from './api.js';
import { verifyToken } from './auth.js';
import { seedIfEmpty } from './seed.js';
import { LiveSimulator } from './simulator.js';

seedIfEmpty();

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: true } });

const room = (companyId: number) => `company:${companyId}`;

const sim = new LiveSimulator(
  (companyId, updates) => {
    io.to(room(companyId)).to('admin').emit('vehicles:update', { companyId, updates });
  },
  (alert) => {
    io.to(room(alert.company_id)).to('admin').emit('alert', alert);
  },
);

io.use((socket, next) => {
  const user = verifyToken(socket.handshake.auth?.token as string | undefined);
  if (!user) return next(new Error('Unauthorized'));
  socket.data.user = user;
  next();
});

io.on('connection', (socket) => {
  const user = socket.data.user;
  socket.join(user.role === 'admin' ? 'admin' : room(user.company_id));
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/api', createApi(sim));

const clientDist = new URL('../../client/dist', import.meta.url).pathname;
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('/{*splat}', (_req, res) => res.sendFile(`${clientDist}/index.html`));
}

sim.start();
const port = Number(process.env.PORT ?? 4000);
server.listen(port, () => console.log(`[drevantix] API listening on http://localhost:${port}`));
