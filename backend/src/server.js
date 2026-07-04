require('dotenv').config();

const { assertJwtConfig } = require('./config/jwt');
const app = require('./app');
const { initDatabase } = require('./db/init');

const port = process.env.PORT || 4000;

(async () => {
  try {
    assertJwtConfig();
    await initDatabase();

    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
})();
