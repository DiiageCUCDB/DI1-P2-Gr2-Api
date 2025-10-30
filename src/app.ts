import { app } from '@/lib/express';

// Importing routes
import serverRoutes from '@/API/routes/server.routes';

import challengeRoutes from '@/API/routes/challenges.routes';

// API routes
app.use('/api', serverRoutes);

// Mount the API routes
app.use('/api/challenges', challengeRoutes);

export default app;