import { pool } from "../config/db.js";
import { generateId, toDoc, Query, SingleQuery, buildWhereClause } from "./base.js";

class Artist {
  static find(filter) {
    return new Query("Artist", filter);
  }

  static findById(id) {
    const promise = (async () => {
      const [rows] = await pool.query("SELECT * FROM artists WHERE _id = ? LIMIT 1", [id]);
      return toDoc(rows[0], "Artist");
    })();
    return new SingleQuery("Artist", promise);
  }

  static async create(fields) {
    if (Array.isArray(fields)) {
      const results = [];
      for (const f of fields) {
        results.push(await this.create(f));
      }
      return results;
    }

    const _id = generateId();
    await pool.query(
      "INSERT INTO artists (_id, name, thumbnail, isYoutubeArtist, youtubeChannelId) VALUES (?, ?, ?, ?, ?)",
      [_id, fields.name, fields.thumbnail || null, fields.isYoutubeArtist ? 1 : 0, fields.youtubeChannelId || null]
    );

    // Als er nummers zijn meegegeven (in seed bijv.), koppel ze
    if (fields.songs && Array.isArray(fields.songs)) {
      for (const songId of fields.songs) {
        const resolvedSongId = typeof songId === "object" ? (songId._id || songId.id) : songId;
        await pool.query("INSERT IGNORE INTO artist_songs (artistId, songId) VALUES (?, ?)", [_id, resolvedSongId]);
      }
    }

    return toDoc({ _id, ...fields, songs: fields.songs || [] }, "Artist");
  }

  static async findOneAndUpdate(filter, update, options = {}) {
    const { name, isYoutubeArtist } = filter;
    const table = "artists";

    const [rows] = await pool.query(
      `SELECT * FROM ${table} WHERE name = ? AND isYoutubeArtist = ? LIMIT 1`,
      [name, isYoutubeArtist ? 1 : 0]
    );
    let artist = rows[0];

    const sets = update.$set || {};
    const onInserts = update.$setOnInsert || {};
    const addToSet = update.$addToSet || {};
    const pull = update.$pull || {};

    if (!artist && options.upsert) {
      const _id = generateId();
      const thumbnail = sets.thumbnail || onInserts.thumbnail || null;
      const youtubeChannelId = sets.youtubeChannelId || onInserts.youtubeChannelId || null;

      await pool.query(
        `INSERT INTO ${table} (_id, name, thumbnail, isYoutubeArtist, youtubeChannelId) VALUES (?, ?, ?, ?, ?)`,
        [_id, name, thumbnail, isYoutubeArtist ? 1 : 0, youtubeChannelId]
      );

      const [insertedRows] = await pool.query(`SELECT * FROM ${table} WHERE _id = ? LIMIT 1`, [_id]);
      artist = insertedRows[0];
    } else if (artist) {
      const setClauses = [];
      const updateParams = [];
      for (const [key, val] of Object.entries(sets)) {
        setClauses.push(`\`${key}\` = ?`);
        updateParams.push(val);
      }
      if (setClauses.length > 0) {
        updateParams.push(artist._id);
        await pool.query(`UPDATE ${table} SET ${setClauses.join(", ")} WHERE _id = ?`, updateParams);
      }
    }

    if (!artist) return null;

    if (addToSet.songs) {
      const songId = typeof addToSet.songs === "object" ? (addToSet.songs._id || addToSet.songs.id) : addToSet.songs;
      await pool.query(
        "INSERT IGNORE INTO artist_songs (artistId, songId) VALUES (?, ?)",
        [artist._id, songId]
      );
    }

    if (pull.songs) {
      const songId = typeof pull.songs === "object" ? (pull.songs._id || pull.songs.id) : pull.songs;
      await pool.query("DELETE FROM artist_songs WHERE artistId = ? AND songId = ?", [artist._id, songId]);
    }

    const promise = (async () => {
      const [res] = await pool.query(`SELECT * FROM ${table} WHERE _id = ? LIMIT 1`, [artist._id]);
      return toDoc(res[0], "Artist");
    })();
    return new SingleQuery("Artist", promise);
  }

  static async updateMany(filter, update) {
    if (filter.songs && update.$set && update.$set["songs.$"]) {
      const oldId = filter.songs;
      const newId = update.$set["songs.$"];
      await pool.query("UPDATE artist_songs SET songId = ? WHERE songId = ?", [newId, oldId]);
    }
  }

  static async findByIdAndDelete(id) {
    const [rows] = await pool.query("SELECT * FROM artists WHERE _id = ?", [id]);
    const doc = rows[0];
    if (doc) {
      await pool.query("DELETE FROM artists WHERE _id = ?", [id]);
    }
    return toDoc(doc, "Artist");
  }

  static async deleteMany(filter = {}) {
    const { where, params } = buildWhereClause(filter);
    const [result] = await pool.query(`DELETE FROM artists ${where}`, params);
    return { deletedCount: result.affectedRows };
  }

  static async countDocuments() {
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM artists");
    return rows[0].count;
  }
}

export default Artist;
