require('dotenv').config({ quiet: true });
const express = require('express');
const { sequelize } = require('./models');
const router = require('./router');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(express.json());

app.get('/health', async (req, res) => {
  await sequelize.query('SELECT 1');
  res.json({ ok: true });
});

app.use('/api', router);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 4000;

sequelize
  .authenticate()
  .then(() => {
    app.listen(port, () => console.log(`newsletter-api listening on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error('Could not connect to the database:', err.message);
    process.exit(1);
  });

module.exports = app;
