import { pool } from "../config/db.js";
import { generateId, toDoc, Query, SingleQuery, buildWhereClause } from "./base.js";

class Song {
  static find(filter) {
    return new Query("Song", filter);
  }

  static findById(id) {
    const promise = (async () => {
      const [rows] = await pool.query("SELECT * FROM songs WHERE _id = ? LIMIT 1", [id]);
      return toDoc(rows[0], "Song");
    })();
    return new SingleQuery("Song", promise);
  }

  static findOne(filter) {
    const promise = (async () => {
      const { where, params } = buildWhereClause(filter);
      const [rows] = await pool.query(`SELECT * FROM songs ${where} LIMIT 1`, params);
      return toDoc(rows[0], "Song");
    })();
    return new SingleQuery("Song", promise);
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
    const sql = `INSERT INTO songs (
      _id, title, artist, album, type, filePath, youtubeId, sourceYoutubeId, thumbnail, duration
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      _id,
      fields.title,
      fields.artist,
      fields.album || null,
      fields.type || "mp3",
      fields.filePath || null,
      fields.youtubeId || null,
      fields.sourceYoutubeId || null,
      fields.thumbnail || null,
      fields.duration || 0
    ];
    await pool.query(sql, params);
    return toDoc({ _id, ...fields }, "Song");
  }

  static async findOneAndUpdate(filter, update, options = {}) {
    const { where, params } = buildWhereClause(filter);
    const table = "songs";
    
    const [rows] = await pool.query(`SELECT * FROM ${table} ${where} LIMIT 1`, params);
    let doc = rows[0];

    const sets = update.$set || {};
    const onInserts = update.$setOnInsert || {};

    if (doc) {
      const setClauses = [];
      const updateParams = [];
      for (const [key, val] of Object.entries(sets)) {
        setClauses.push(`\`${key}\` = ?`);
        updateParams.push(val);
      }
      if (setClauses.length > 0) {
        updateParams.push(doc._id);
        await pool.query(`UPDATE ${table} SET ${setClauses.join(", ")} WHERE _id = ?`, updateParams);
      }
    } else if (options.upsert) {
      const _id = generateId();
      const allFields = { _id, ...sets, ...onInserts, ...filter };
      
      const columns = [];
      const valuesPlaceholders = [];
      const insertParams = [];
      
      for (const [key, val] of Object.entries(allFields)) {
        if (key.startsWith("$")) continue;
        columns.push(`\`${key}\``);
        valuesPlaceholders.push("?");
        insertParams.push(val);
      }
      
      await pool.query(
        `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${valuesPlaceholders.join(", ")})`,
        insertParams
      );
    } else {
      return null;
    }

    const [updatedRows] = await pool.query(`SELECT * FROM ${table} ${where} LIMIT 1`, params);
    return toDoc(updatedRows[0], "Song");
  }

  static async findByIdAndDelete(id) {
    const [rows] = await pool.query("SELECT * FROM songs WHERE _id = ?", [id]);
    const doc = rows[0];
    if (doc) {
      await pool.query("DELETE FROM songs WHERE _id = ?", [id]);
    }
    return toDoc(doc, "Song");
  }

  static async deleteMany(filter = {}) {
    const { where, params } = buildWhereClause(filter);
    const [result] = await pool.query(`DELETE FROM songs ${where}`, params);
    return { deletedCount: result.affectedRows };
  }

  static async countDocuments() {
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM songs");
    return rows[0].count;
  }
}

export default Song;
