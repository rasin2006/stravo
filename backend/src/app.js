const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const activityRoutes = require('./routes/activityRoutes');
const segmentRoutes = require('./routes/segmentRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/segments', segmentRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

const sequelize = require('./config/database');
const { isPostgres } = require('./config/dbTypes');
const { User, Activity, ActivityPoint, ActivitySegment, SegmentFeedback } = require('./models');

const port = process.env.PORT || 4000;

(async () => {
  try {
    // SQLite cannot safely run `alter: true` — it leaves backup tables and
    // breaks on FK/unique constraints. Only auto-alter on Postgres.
    await sequelize.sync(isPostgres ? { alter: true } : undefined);

    // No default segment seeding here, as ActivitySegments are user-generated.
    // If you introduce 'PredefinedSegments' later, you can seed them here.

    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
})();
