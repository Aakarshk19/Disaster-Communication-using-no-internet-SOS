import initSqlJs from "sql.js";

let dbInstance = null;

export async function initDb() {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`,
  });

  dbInstance = new SQL.Database();

  // Add lat/lng for map
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT,
      location TEXT,
      raised_by TEXT,
      timestamp TEXT,
      status TEXT DEFAULT 'new',
      lat REAL,
      lng REAL
    );
  `);

  // Insert some sample data with coordinates
  dbInstance.run(`
    INSERT INTO issues (description, location, raised_by, timestamp, status, lat, lng) VALUES
    ('Water leakage in Block A', 'Block A - Floor 2', 'Priya', datetime('now'), 'new', 28.6139, 77.2090),
    ('Streetlight not working', 'North Gate', 'Admin', datetime('now'), 'resolved', 28.7041, 77.1025),
    ('Garbage not collected', 'Block C - Floor 1', 'John', datetime('now'), 'unsolved', 19.0760, 72.8777);
  `);

  return dbInstance;
}

export function getIssues() {
  const res = dbInstance.exec("SELECT * FROM issues");
  if (res.length === 0) return [];
  return res[0].values.map(row => ({
    id: row[0],
    description: row[1],
    location: row[2],
    raised_by: row[3],
    timestamp: row[4],
    status: row[5],
    lat: row[6],
    lng: row[7],
  }));
}

export function updateIssueStatus(id, newStatus) {
  dbInstance.run("UPDATE issues SET status = ? WHERE id = ?", [newStatus, id]);
}
