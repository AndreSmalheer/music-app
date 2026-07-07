import { pool } from "../config/db.js";
import { generateId, toDoc, Query, SingleQuery, buildWhereClause } from "./base.js";

class Playlist {
  static find(filter) {
    return new Query("Playlist", filter);
  }

  static findById(id) {
    const promise = (async () => {
      const [rows] = await pool.query("SELECT * FROM playlists WHERE _id = ? LIMIT 1", [id]);
      return toDoc(rows[0], "Playlist");
    })();
    return new SingleQuery("Playlist", promise);
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
      "INSERT INTO playlists (_id, name, description, thumbnail) VALUES (?, ?, ?, ?)",
      [_id, fields.name, fields.description || "", fields.thumbnail || ""]
    );

    if (fields.songs && Array.isArray(fields.songs)) {
      for (const songId of fields.songs) {
        const resolvedSongId = typeof songId === "object" ? (songId._id || songId.id) : songId;
        await pool.query(
          "INSERT INTO playlist_songs (playlistId, songId) VALUES (?, ?)",
          [_id, resolvedSongId]
        );
      }
    }

    return toDoc({ _id, ...fields, songs: fields.songs || [] }, "Playlist");
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const sets = update.$set || update;
    const table = "playlists";

    const setClauses = [];
    const updateParams = [];
    for (const [key, val] of Object.entries(sets)) {
      if (key === "songs") continue;
      setClauses.push(`\`${key}\` = ?`);
      updateParams.push(val);
    }
    
    if (setClauses.length > 0) {
      updateParams.push(id);
      await pool.query(`UPDATE ${table} SET ${setClauses.join(", ")} WHERE _id = ?`, updateParams);
    }

    if (sets.songs && Array.isArray(sets.songs)) {
      await pool.query("DELETE FROM playlist_songs WHERE playlistId = ?", [id]);
      for (const songId of sets.songs) {
        const resolvedSongId = typeof songId === "object" ? (songId._id || songId.id) : songId;
        await pool.query(
          "INSERT INTO playlist_songs (playlistId, songId) VALUES (?, ?)",
          [id, resolvedSongId]
        );
      }
    }

    const promise = (async () => {
      const [rows] = await pool.query(`SELECT * FROM ${table} WHERE _id = ? LIMIT 1`, [id]);
      return toDoc(rows[0], "Playlist");
    })();
    return new SingleQuery("Playlist", promise);
  }

  static async findByIdAndDelete(id) {
    const [rows] = await pool.query("SELECT * FROM playlists WHERE _id = ?", [id]);
    const doc = rows[0];
    if (doc) {
      await pool.query("DELETE FROM playlists WHERE _id = ?", [id]);
    }
    return toDoc(doc, "Playlist");
  }

  static async updateMany(filter, update) {
    if (filter.songs && update.$set && update.$set["songs.$"]) {
      const oldId = filter.songs;
      const newId = update.$set["songs.$"];
      await pool.query("UPDATE playlist_songs SET songId = ? WHERE songId = ?", [newId, oldId]);
    }
  }

  static async deleteMany(filter = {}) {
    const { where, params } = buildWhereClause(filter);
    const [result] = await pool.query(`DELETE FROM playlists ${where}`, params);
    return { deletedCount: result.affectedRows };
  }

  static async countDocuments() {
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM playlists");
    return rows[0].count;
  }
}

export default Playlist;
