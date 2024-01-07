const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: 'postgres',
  host: 'mymusic-db.chvleo7wdzo9.us-east-1.rds.amazonaws.com',
  database: 'postgres',
  password: 'Print930409',
  port: 5432,
  ssl: true,
  connectionString: 'postgresql://postgres:Print930409@mymusic-db.chvleo7wdzo9.us-east-1.rds.amazonaws.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

console.log('Database pool connected successfully!');

app.get('/api/data', async (req, res) => {
  const { songName, songArtist, songAlbum, status } = req.query;
  console.log(songName);
  console.log(songArtist);
  console.log(songAlbum);

  if (status === '0') {
    // If status is 0, perform random selection
    const randomTrackId = await getRandomTrackId();
    res.json([{ track_id: randomTrackId }]);
    return;
  }

  let query = '';
  let queryParams = [];
  if (songName) {
    query = 'SELECT track_id FROM spotify WHERE track_name = $1 LIMIT 1;';
    queryParams = [songName];
  } else if (songAlbum) {
    query = 'SELECT track_id FROM spotify WHERE album_name = $1 LIMIT 1;';
    queryParams = [songAlbum];
  } else if (songArtist) {
    query = 'SELECT track_id FROM spotify WHERE artists_names = $1 LIMIT 1;';
    queryParams = [songArtist];
  } else {
    // If none of the parameters are provided, return an error response
    return res.status(400).json({ error: 'Bad Request', details: 'At least one of songName, songArtist, or songAlbum must be provided.' });
  }
  try {
    const result = await pool.query(query, queryParams);
    console.log('Query result:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/api/data/query_test', async (req, res) => {
  const { /*...傳入變數 */ } = req.query;

  let query = '';
  let queryParams = [];
  query = 'SELECT track_id FROM spotify WHERE track_name = $1 LIMIT 1;'; //query 語法，"$1"：變數1(放在queryParams中)，幫我放在一串string裡面像這樣
  queryParams = [/*...篩選變數 */];
  try {
    const result = await pool.query(query, queryParams);
    console.log('Query result:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

/*app.post('/api/data', (req, res) => {
  console.log(req.body.songName);
  SongName = req.body.songName; // Update global songName
  res.json({ success: true });
});*/

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const getRandomTrackId = async () => {
  try {
    const result = await pool.query('SELECT track_id FROM spotify ORDER BY RANDOM() LIMIT 1;');
    return result.rows[0].track_id;
  } catch (error) {
    console.error('Error getting random track_id', error);
    throw error;
  }
};

/*const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'mymusic-db.chvleo7wdzo9.us-east-1.rds.amazonaws.com',
  database: 'mymusic-db',
  password: 'Print930409',
  port: 5432,
  connectTimeoutMillis: 30000,
});

client.connect();

client.query('SELECT track_id FROM spotify LIMIT 1;', (err, res) => {
  console.log(err ? err.stack : res.rows);
  client.end();
});*/

/*const app = express();
const port = 3001;

// Replace these with your actual database connection details
const pool = new Pool({
  user: 'postgres',
  host: 'mymusic-db.chvleo7wdzo9.us-east-1.rds.amazonaws.com',
  database: 'MyMusic_server',
  password: 'Print930409',
  port: 5432,
});

//set PGUSER=postgres
//set PGHOST=mymusic-db.chvleo7wdzo9.us-east-1.rds.amazonaws.com
//set PGDATABASE=MyMusic_server
//set PGPASSWORD=Print930409
//set PGPORT=5432

app.get('/api/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM your_table');
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});*/