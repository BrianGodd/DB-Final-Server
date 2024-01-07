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

//weekly list
app.get('/api/data/query_weekly_ranking', async (req, res) => {
    const {} = req.query;

    let query = '';
    let queryParams = [];
    query = 'SELECT id_, track_id FROM Weekly_List;';
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

//search
app.get('/api/data/query_search_song', async (req, res) => {
    const {song, artist, album} = req.query;

    let query = '';
    let queryParams = [];
    query = 'SELECT Song.track_id, Song.track_name, Artist.artist_name, Album.album_name, Song_to_Album.track_number, Song.popularity, Constraints.duration_ms, Constraints.year FROM public.Song JOIN public.Song_to_Artist ON Song.track_id = Song_to_Artist.track_id JOIN public.Artist ON Song_to_Artist.artist_id = Artist.artist_id JOIN public.Song_to_Album ON Song.track_id = Song_to_Album.track_id JOIN public.Album ON Song_to_Album.album_id = Album.album_id LEFT JOIN  public.Constraints ON Song.track_id = Constraints.track_id LEFT JOIN public.Parameter ON Song.track_id = Parameter.track_id WHERE Song.track_name LIKE $1 AND Artist.artist_name LIKE $2 AND Album.album_name LIKE $3;';
    queryParams = [song, artist, album ];
    try {
        const result = await pool.query(query, queryParams);
        console.log('Query result:', result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message});
    }
});

//guess 2個版本
app.get('/api/data/query_guess_song', async (req, res) => {
    const {song, artist, album} = req.query;

    let query = '';
    let queryParams = [];
    query = 'WITH FilteredTracks AS ( SELECT s.track_id, s.track_name, a.artist_name, al.album_name, s.popularity, ROW_NUMBER() OVER (ORDER BY RANDOM()) AS rn FROM public.Song s JOIN public.Song_to_Artist sta ON s.track_id = sta.track_id JOIN  public.Artist a ON sta.artist_id = a.artist_id JOIN public.Song_to_Album sta2a ON s.track_id = sta2a.track_id JOIN public.Album al ON sta2a.album_id = al.album_id WHERE s.popularity >= 20 AND (  s.track_name =  COALESCE(NULLIF('$1', ''), s.track_name) OR a.artist_name = COALESCE(NULLIF('$2', ''), a.artist_name) OR al.album_name = COALESCE(NULLIF('$3', ''), al.album_name))) SELECT track_id,  track_name, artist_name, album_name, popularity FROM FilteredTracks WHERE rn <= 4;';
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

//我不知道為甚麼上面那個不行 下面那個是chatgpt的版本
app.get('/api/data/query_guess_song', async (req, res) => {
    const { song, artist, album } = req.query;

    const conditions = [];
    const queryParams = [];

    if (song) {
        conditions.push("s.track_name = $1");
        queryParams.push(song);
    }
    if (artist) {
        conditions.push("a.artist_name = $2");
        queryParams.push(artist);
    }
    if (album) {
        conditions.push("al.album_name = $3");
        queryParams.push(album);
    }

    let query = `
        WITH FilteredTracks AS (
            SELECT s.track_id, s.track_name, a.artist_name, al.album_name, s.popularity, 
            ROW_NUMBER() OVER (ORDER BY random()) AS rn 
            FROM public.Song s 
            JOIN public.Song_to_Artist sta ON s.track_id = sta.track_id 
            JOIN public.Artist a ON sta.artist_id = a.artist_id 
            JOIN public.Song_to_Album sta2a ON s.track_id = sta2a.track_id 
            JOIN public.Album al ON sta2a.album_id = al.album_id 
            WHERE s.popularity >= 20 ${conditions.length > 0 ? `AND (${conditions.join(' OR ')})` : ''}
        )
        SELECT track_id, track_name, artist_name, album_name, popularity 
        FROM FilteredTracks 
        WHERE rn <= 4;
    `;

    try {
        const result = await pool.query(query, queryParams);
        console.log('Query result:', result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

