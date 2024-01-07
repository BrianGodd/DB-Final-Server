const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: 'postgres',
  host: 'database-2.c8dhylstxkf5.us-east-1.rds.amazonaws.com',
  database: 'postgres',
  password: '1qaz2wsx',
  port: 5432,
  ssl: true,
  connectionString: 'postgresql://postgres:1qaz2wsx@database-2.c8dhylstxkf5.us-east-1.rds.amazonaws.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

console.log('Database pool connected successfully!');

//search
app.get('/api/data/query_search_song', async (req, res) => {
    const {song, artist, album} = req.query;
    console.log(song);
    console.log(artist);
    console.log(album);
    let query = '';
    let queryParams = [];
    query = 
    `SELECT Song.track_id, Song.track_name, Artist.artist_name, Album.album_name, Song_to_Album.track_number, Song.popularity, Constraints.duration_ms, Constraints.year 
    FROM public.Song 
    JOIN public.Song_to_Artist ON Song.track_id = Song_to_Artist.track_id 
    JOIN public.Artist ON Song_to_Artist.artist_id = Artist.artist_id 
    JOIN public.Song_to_Album ON Song.track_id = Song_to_Album.track_id 
    JOIN public.Album ON Song_to_Album.album_id = Album.album_id LEFT 
    JOIN  public.Constraints ON Song.track_id = Constraints.track_id LEFT 
    JOIN public.Parameter ON Song.track_id = Parameter.track_id 
    WHERE Song.track_name ILIKE  COALESCE(NULLIF($1, ''), '%%') AND Artist.artist_name ILIKE  COALESCE(NULLIF($2, ''), '%%') AND Album.album_name ILIKE  COALESCE(NULLIF($3, ''), '%%')`;
    queryParams = [song, artist, album];
    try {
        const result = await pool.query(query, queryParams);
        console.log('Query result:', result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message});
    }
});

//guess
app.get('/api/data/query_guess_song', async (req, res) => {
  const {song, artist, album} = req.query;
  console.log(song);
  console.log(artist);
  console.log(album);

  let query = '';
  let queryParams = [];
  query = `WITH FilteredTracks AS 
  ( 
  SELECT s.track_id, s.track_name, a.artist_name, al.album_name, s.popularity, 
  ROW_NUMBER() OVER (ORDER BY RANDOM()) AS rn 
  FROM public.Song s 
  JOIN public.Song_to_Artist sta ON s.track_id = sta.track_id 
  JOIN  public.Artist a ON sta.artist_id = a.artist_id 
  JOIN public.Song_to_Album sta2a ON s.track_id = sta2a.track_id 
  JOIN public.Album al ON sta2a.album_id = al.album_id 
  WHERE s.popularity >= 20
  AND s.track_name ILIKE  COALESCE(NULLIF($1, ''), '%%') AND a.artist_name ILIKE COALESCE(NULLIF($2, ''), '%%') AND al.album_name ILIKE COALESCE(NULLIF($3, ''), '%%'))
  
  SELECT track_id,  track_name, artist_name, album_name, popularity 
  FROM FilteredTracks WHERE rn <= 4;`;
  queryParams = [song, artist, album];
  try {
      const result = await pool.query(query, queryParams);
      console.log('Query result:', result.rows);
      res.json(result.rows);
  } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message});
  }
});

//song list
app.get('/api/data/query_gain_songlist', async (req, res) => {
  const {current_name} = req.query;

  let query = '';
  let queryParams = [];
  query = 'SELECT track_id, add_time FROM Song_List WHERE user_name = $1;';
  queryParams = [current_name];
  try {
      const result = await pool.query(query, queryParams);
      console.log('Query result:', result.rows);
      res.json(result.rows);
  } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message});
  }
});

//user table
app.get('/api/data/query_gain_passwordnickname', async (req, res) => {
  const {current_name} = req.query;

  let query = '';
  let queryParams = [];
  query = 'SELECT password_, nickname FROM User_Information WHERE user_name = $1;';
  queryParams = [current_name];
  try {
      const result = await pool.query(query, queryParams);
      console.log('Query result:', result.rows);
      res.json(result.rows);
  } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message});
  }
});

//guess ranking list
app.get('/api/data/query_guess_ranking', async (req, res) => {
  const {} = req.query;

  let query = '';
  let queryParams = [];
  query = 'SELECT user_name, nickname, right_number FROM Guess_Ranking_List;';
  queryParams = [];
  try {
      const result = await pool.query(query, queryParams);
      console.log('Query result:', result.rows);
      res.json(result.rows);
  } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message});
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});