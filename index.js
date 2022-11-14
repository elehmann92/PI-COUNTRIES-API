const server = require('./src/app.js');
const { conn } = require('./src/db.js');
const { updateIfNeeded } = require('./src/handlers/dbControl.js');
const {PORT = 3001} = process.env

// Syncing all the models at once.
conn.sync({ force: false }).then(() => {
  server.listen(PORT, () => {
    console.log(`Server listening at ${PORT}`); // eslint-disable-line no-console
  });
})
// .then(()=> updateIfNeeded());
