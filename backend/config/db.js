import mysql from "mysql2/promise";

export let pool = null;

// Verbindt met MariaDB via de URI uit .env.
// Gooit bij falen een error zodat server.js de app netjes kan afsluiten.
export async function connectDB() {
  const uri = process.env.MARIADB_URI || process.env.DATABASE_URL;
  if (!uri) {
    throw new Error("MARIADB_URI of DATABASE_URL ontbreekt in .env");
  }

  // Eerst verbinden zonder database om te zorgen dat de database bestaat
  try {
    const connectionUriObj = new URL(uri);
    const databaseName = connectionUriObj.pathname.replace("/", "") || "muziekapp";
    
    connectionUriObj.pathname = "";
    const baseUri = connectionUriObj.toString();

    const tempConn = await mysql.createConnection(baseUri);
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
    await tempConn.end();
  } catch (err) {
    console.warn("⚠️ Kon database niet vooraf aanmaken (mogelijk onvoldoende rechten), we proberen direct te verbinden:", err.message);
  }

  // Verbinden met de pool incl. geselecteerde database
  pool = mysql.createPool(uri);
  console.log("✅ Verbonden met MariaDB pool");

  // Tabellen initialiseren
  await initializeTables();
}

export async function disconnectDB() {
  if (pool) {
    await pool.end();
    console.log("🔌 MariaDB verbinding gesloten");
  }
}

async function initializeTables() {
  // 1. Songs tabel
  await pool.query(`
    CREATE TABLE IF NOT EXISTS songs (
      _id VARCHAR(24) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      artist VARCHAR(255) NOT NULL,
      album VARCHAR(255),
      type VARCHAR(50) DEFAULT 'mp3',
      filePath VARCHAR(255),
      youtubeId VARCHAR(50) UNIQUE,
      sourceYoutubeId VARCHAR(50) UNIQUE,
      thumbnail VARCHAR(255),
      duration INT DEFAULT 0,
      addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Artists tabel
  await pool.query(`
    CREATE TABLE IF NOT EXISTS artists (
      _id VARCHAR(24) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      thumbnail VARCHAR(255),
      isYoutubeArtist BOOLEAN DEFAULT FALSE,
      youtubeChannelId VARCHAR(255),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_name_source (name, isYoutubeArtist)
    )
  `);

  // 3. ArtistSongs koppeltabel
  await pool.query(`
    CREATE TABLE IF NOT EXISTS artist_songs (
      artistId VARCHAR(24) NOT NULL,
      songId VARCHAR(24) NOT NULL,
      PRIMARY KEY (artistId, songId),
      FOREIGN KEY (artistId) REFERENCES artists(_id) ON DELETE CASCADE,
      FOREIGN KEY (songId) REFERENCES songs(_id) ON DELETE CASCADE
    )
  `);

  // 4. Playlists tabel
  await pool.query(`
    CREATE TABLE IF NOT EXISTS playlists (
      _id VARCHAR(24) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      thumbnail VARCHAR(255),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // 5. PlaylistSongs koppeltabel
  await pool.query(`
    CREATE TABLE IF NOT EXISTS playlist_songs (
      playlistId VARCHAR(24) NOT NULL,
      songId VARCHAR(24) NOT NULL,
      \`order\` INT NOT NULL AUTO_INCREMENT,
      PRIMARY KEY (\`order\`),
      UNIQUE KEY unique_playlist_song (playlistId, songId),
      FOREIGN KEY (playlistId) REFERENCES playlists(_id) ON DELETE CASCADE,
      FOREIGN KEY (songId) REFERENCES songs(_id) ON DELETE CASCADE
    )
  `);

  // 6. RecentlyPlayed tabel
  await pool.query(`
    CREATE TABLE IF NOT EXISTS recently_played (
      _id VARCHAR(24) PRIMARY KEY,
      songId VARCHAR(24) NOT NULL,
      lastPlayed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      playedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (songId) REFERENCES songs(_id) ON DELETE CASCADE
    )
  `);
}
