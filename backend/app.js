const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { randomUUID } = require('node:crypto');
const { HttpError, handleError } = require('./middleware/errors');

function createApp(config) {
  const app = express();
  app.locals.config = config;
  app.set('trust proxy', config.trustProxy);
  app.set('query parser', 'simple');
  app.use((req, res, next) => {
    req.id = randomUUID();
    res.set('X-Request-Id', req.id);
    if (req.path.startsWith('/api/')) res.set('Cache-Control', 'no-store');
    next();
  });
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins, exposedHeaders: ['X-Request-Id', 'Link'] }));
  app.use(express.json({ limit: '32kb' }));

  app.get('/', (req, res) => res.send('Job Portal API running'));
  for (const [path, router] of [
    ['auth', require('./routes/authRoutes')],
    ['jobs', require('./routes/jobRoutes')],
    ['applications', require('./routes/applicationRoutes')],
    ['exa', require('./routes/exaRoutes')],
    ['upload', require('./routes/uploadRoutes')],
    ['admin', require('./routes/adminRoutes')],
  ]) {
    app.use('/api/' + path, router());
  }

  app.use((req, res, next) => next(new HttpError(404, 'Route not found')));
  app.use(handleError);
  return app;
}

module.exports = createApp;
