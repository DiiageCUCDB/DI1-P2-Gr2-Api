import { app } from '@/lib/express';

// Importing routes
import serverRoutes from '@/API/routes/server.routes';

import challengeRoutes from '@/API/routes/challenges.routes';
import questionRoutes from '@/API/routes/questions.route';
import responseRoutes from '@/API/routes/responses.routes';
import loginRoutes from '@/API/routes/login.routes'

// API routes
app.use('/api', serverRoutes);

// Mount the API routes
app.use('/api/challenges', challengeRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/login', loginRoutes);

export default app;