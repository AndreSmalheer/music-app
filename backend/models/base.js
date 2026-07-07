import { pool } from "../config/db.js";

export function generateId() {
  return Array.from({ length: 24 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

export function toDoc(obj, modelName) {
  if (!obj) return null;
  if (obj._id) obj._id = String(obj._id);
  
  const doc = {
    ...obj,
    toObject() {
      return this;
    }
  };

  doc.save = async function() {
    if (modelName === "Artist") {
      await pool.query(
        "UPDATE artists SET name = ?, thumbnail = ?, isYoutubeArtist = ?, youtubeChannelId = ? WHERE _id = ?",
        [this.name, this.thumbnail || null, this.isYoutubeArtist ? 1 : 0, this.youtubeChannelId || null, this._id]
      );
      if (this.songs) {
        await pool.query("DELETE FROM artist_songs WHERE artistId = ?", [this._id]);
        for (const songId of this.songs) {
          const resolvedSongId = typeof songId === "object" ? (songId._id || songId.id) : songId;
          await pool.query("INSERT IGNORE INTO artist_songs (artistId, songId) VALUES (?, ?)", [this._id, resolvedSongId]);
        }
      }
    } else if (modelName === "Playlist") {
      await pool.query(
        "UPDATE playlists SET name = ?, description = ?, thumbnail = ? WHERE _id = ?",
        [this.name, this.description || "", this.thumbnail || "", this._id]
      );
      if (this.songs) {
        await pool.query("DELETE FROM playlist_songs WHERE playlistId = ?", [this._id]);
        for (const songId of this.songs) {
          const resolvedSongId = typeof songId === "object" ? (songId._id || songId.id) : songId;
          await pool.query("INSERT INTO playlist_songs (playlistId, songId) VALUES (?, ?)", [this._id, resolvedSongId]);
        }
      }
    } else if (modelName === "RecentlyPlayed") {
      // Zowel songId als song (MongoDB objectId ref) kunnen bewaard worden
      const resolvedSongId = typeof this.song === "object" ? (this.song._id || this.song.id) : (this.song || this.songId);
      await pool.query(
        "UPDATE recently_played SET songId = ?, lastPlayed = ?, playedAt = ? WHERE _id = ?",
        [resolvedSongId || null, this.lastPlayed || new Date(), this.playedAt || new Date(), this._id]
      );
    } else if (modelName === "Song") {
      await pool.query(
        `UPDATE songs SET title = ?, artist = ?, album = ?, type = ?, filePath = ?, 
         youtubeId = ?, sourceYoutubeId = ?, thumbnail = ?, duration = ? WHERE _id = ?`,
        [
          this.title, this.artist, this.album || null, this.type || "mp3", this.filePath || null,
          this.youtubeId || null, this.sourceYoutubeId || null, this.thumbnail || null, this.duration || 0, this._id
        ]
      );
    }
    return this;
  };

  return doc;
}

export function buildWhereClause(filter) {
  const conditions = [];
  const params = [];

  for (const [key, value] of Object.entries(filter)) {
    if (key === "$or") {
      const orConditions = [];
      for (const cond of value) {
        for (const [orKey, orVal] of Object.entries(cond)) {
          if (orVal instanceof RegExp) {
            const searchStr = orVal.source.replace(/\\(.)/g, "$1");
            orConditions.push(`\`${orKey}\` LIKE ?`);
            params.push(`%${searchStr}%`);
          } else {
            orConditions.push(`\`${orKey}\` = ?`);
            params.push(orVal);
          }
        }
      }
      if (orConditions.length > 0) {
        conditions.push(`(${orConditions.join(" OR ")})`);
      }
    } else if (key === "youtubeId" && value && typeof value === "object" && "$exists" in value) {
      if (value.$exists === false) {
        conditions.push("`youtubeId` IS NULL");
      } else {
        conditions.push("`youtubeId` IS NOT NULL");
      }
    } else if (value && typeof value === "object") {
      if ("$ne" in value) {
        if (value.$ne === true) {
          conditions.push(`\`${key}\` != 1 OR \`${key}\` IS NULL`);
        } else {
          conditions.push(`\`${key}\` != ?`);
          params.push(value.$ne);
        }
      }
    } else if (value instanceof RegExp) {
      const searchStr = value.source.replace(/\\(.)/g, "$1");
      conditions.push(`\`${key}\` LIKE ?`);
      params.push(`%${searchStr}%`);
    } else {
      conditions.push(`\`${key}\` = ?`);
      params.push(value);
    }
  }

  return {
    where: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params
  };
}

export class Query {
  constructor(modelName, filter = {}) {
    this.modelName = modelName;
    this.filter = filter;
    this._sort = null;
    this._limit = null;
    this._populate = [];
  }

  sort(sortObj) {
    this._sort = sortObj;
    return this;
  }

  limit(limitVal) {
    this._limit = limitVal;
    return this;
  }

  populate(field) {
    this._populate.push(field);
    return this;
  }

  async then(onFulfilled, onRejected) {
    try {
      const res = await this.execute();
      return onFulfilled(res);
    } catch (err) {
      if (onRejected) return onRejected(err);
      throw err;
    }
  }

  async execute() {
    const table = this.modelName === "RecentlyPlayed" ? "recently_played" : (this.modelName.toLowerCase() + "s");
    const { where, params } = buildWhereClause(this.filter);

    let queryStr = `SELECT * FROM ${table} ${where}`;

    if (this._sort) {
      const sortParts = [];
      for (const [key, value] of Object.entries(this._sort)) {
        const dir = value === -1 || value === "desc" ? "DESC" : "ASC";
        sortParts.push(`\`${key}\` ${dir}`);
      }
      if (sortParts.length > 0) {
        queryStr += ` ORDER BY ${sortParts.join(", ")}`;
      }
    }

    if (this._limit) {
      queryStr += ` LIMIT ${this._limit}`;
    }

    const [rows] = await pool.query(queryStr, params);
    let docs = rows.map(r => toDoc(r, this.modelName));

    for (const field of this._populate) {
      docs = await populateField(this.modelName, docs, field);
    }

    return docs;
  }
}

export class SingleQuery {
  constructor(modelName, queryPromise) {
    this.modelName = modelName;
    this.queryPromise = queryPromise;
    this._populate = [];
  }

  populate(field) {
    this._populate.push(field);
    return this;
  }

  async then(onFulfilled, onRejected) {
    try {
      const doc = await this.queryPromise;
      if (!doc) return onFulfilled(null);
      let docs = [doc];
      for (const field of this._populate) {
        docs = await populateField(this.modelName, docs, field);
      }
      return onFulfilled(docs[0]);
    } catch (err) {
      if (onRejected) return onRejected(err);
      throw err;
    }
  }
}

async function populateField(modelName, docs, field) {
  if (modelName === "Artist" && field === "songs") {
    for (const doc of docs) {
      const [songs] = await pool.query(
        `SELECT s.* FROM songs s
         JOIN artist_songs asong ON s._id = asong.songId
         WHERE asong.artistId = ?`,
        [doc._id]
      );
      doc.songs = songs.map(s => toDoc(s, "Song"));
    }
  }

  if (modelName === "Playlist" && field === "songs") {
    for (const doc of docs) {
      const [songs] = await pool.query(
        `SELECT s.* FROM songs s
         JOIN playlist_songs psong ON s._id = psong.songId
         WHERE psong.playlistId = ?
         ORDER BY psong.order ASC`,
        [doc._id]
      );
      doc.songs = songs.map(s => toDoc(s, "Song"));
    }
  }

  if (modelName === "RecentlyPlayed" && field === "song") {
    for (const doc of docs) {
      const [songs] = await pool.query("SELECT * FROM songs WHERE _id = ? LIMIT 1", [doc.songId]);
      doc.song = toDoc(songs[0], "Song");
    }
  }

  return docs;
}
