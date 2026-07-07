import { pool } from "../config/db.js";
import { generateId, toDoc, Query, SingleQuery, buildWhereClause } from "./base.js";

class RecentlyPlayed {
  static find(filter) {
    return new Query("RecentlyPlayed", filter);
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
    // Resolve songId from song
    const resolvedSongId = typeof fields.song === "object" ? (fields.song._id || fields.song.id) : fields.song;

    await pool.query(
      "INSERT INTO recently_played (_id, songId, lastPlayed, playedAt) VALUES (?, ?, ?, ?)",
      [_id, resolvedSongId, fields.lastPlayed || new Date(), fields.playedAt || new Date()]
    );

    return toDoc({ _id, ...fields, songId: resolvedSongId }, "RecentlyPlayed");
  }

  static async findOneAndUpdate(filter, update, options = {}) {
    const { song } = filter;
    const table = "recently_played";

    const resolvedSongId = typeof song === "object" ? (song._id || song.id) : song;

    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE songId = ? LIMIT 1`, [resolvedSongId]);
    let entry = rows[0];

    const sets = update.$set || {};

    if (entry) {
      await pool.query(
        `UPDATE ${table} SET lastPlayed = ?, playedAt = ? WHERE _id = ?`,
        [sets.lastPlayed || new Date(), sets.playedAt || new Date(), entry._id]
      );
    } else if (options.upsert) {
      const _id = generateId();
      await pool.query(
        `INSERT INTO ${table} (_id, songId, lastPlayed, playedAt) VALUES (?, ?, ?, ?)`,
        [_id, resolvedSongId, sets.lastPlayed || new Date(), sets.playedAt || new Date()]
      );
      const [inserted] = await pool.query(`SELECT * FROM ${table} WHERE _id = ? LIMIT 1`, [_id]);
      entry = inserted[0];
    }

    if (!entry) return null;

    const promise = (async () => {
      const [res] = await pool.query(`SELECT * FROM ${table} WHERE _id = ? LIMIT 1`, [entry._id]);
      return toDoc(res[0], "RecentlyPlayed");
    })();
    return new SingleQuery("RecentlyPlayed", promise);
  }

  static async updateMany(filter, update) {
    if (filter.song && update.$set && update.$set.song) {
      const oldId = filter.song;
      const newId = update.$set.song;
      await pool.query("UPDATE recently_played SET songId = ? WHERE songId = ?", [newId, oldId]);
    }
  }

  static async deleteMany(filter = {}) {
    const { where, params } = buildWhereClause(filter);
    const [result] = await pool.query(`DELETE FROM recently_played ${where}`, params);
    return { deletedCount: result.affectedRows };
  }

  static async countDocuments() {
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM recently_played");
    return rows[0].count;
  }
}

export default RecentlyPlayed;
