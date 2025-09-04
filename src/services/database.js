import Database from 'better-sqlite3';
import { logger, reportError } from '../utils/logger.js';

const db = new Database('state.db');

const setupDatabase = () => {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS posted_items (
      id TEXT NOT NULL,
      type TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id, type)
    );
  `).run();
  logger.info('Database initialized and table is ready.');
};

/**
 * Checks if an item has already been posted and recorded in the database
 *
 * @param {string} id - The unique ID of the item from the API
 * @param {string} type - The category of the item (e.g., 'alert', 'invasion')
 *
 * @returns {boolean} - True if the item exists in the database, false otherwise or in case of failure
 */
export const isItemPosted = (id, type) => {
  const stmt = db.prepare('SELECT id FROM posted_items WHERE id = ? AND type = ?');

  try {
    return !!stmt.get(id, type);
  } catch (error) {
    reportError(error, { context: 'database.markItemsAsPosted' });

    return false;
  }
};

/**
 * Fetches all posted item IDs for a specific type
 *
 * @param {string} type - The category of items to fetch
 *
 * @returns {Set<string>|null} - A Set containing all the posted IDs for that type, or null on failure
 */
export const getPostedIdsByType = (type) => {
  const stmt = db.prepare('SELECT id FROM posted_items WHERE type = ?');
  try {
    const rows = stmt.all(type);

    return new Set(rows.map(row => row.id));
  } catch (error) {
    reportError(error, { context: 'database.markItemsAsPosted' });

    return null;
  }
};

/**
 * Records a new item in the database to mark it as posted
 * @param {string[]} ids - The unique IDs of the items
 * @param {string} type - The category of the item
 *
 * @returns {{changes: number}|null} - An object with the total number of rows changed, or null on failure
 */
export const markItemsAsPosted = (ids, type) => {
  if (!ids?.length) {
    return { changes: 0 };
  }

  const stmt = db.prepare('INSERT OR IGNORE INTO posted_items (id, type) VALUES (?, ?)');

  const insertMany = db.transaction((idArray) => {
    let totalChanges = 0;

    for (const id of idArray) {
      const info = stmt.run(id, type);
      totalChanges += info.changes;
    }

    return totalChanges;
  });

  try {
    const totalChanges = insertMany(ids);
    logger.debug(`Marked ${totalChanges} new items as posted (out of ${ids.length} candidates) with type "${type}".`);

    return { changes: totalChanges };
  } catch (error) {
    reportError(error, { context: 'database.markItemsAsPosted' });

    return null;
  }
};

setupDatabase();
