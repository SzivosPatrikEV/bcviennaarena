const fs = require("node:fs");
const path = require("node:path");
const mysql = require("mysql2/promise");

const envFile = path.join(__dirname, ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/i);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

async function main() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: "utf8mb4"
  });
  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS events (
      id CHAR(36) NOT NULL PRIMARY KEY, title VARCHAR(160) NOT NULL, date DATE NOT NULL,
      endDate DATE NOT NULL, startTime CHAR(5) NOT NULL, endTime CHAR(5) NOT NULL,
      venue VARCHAR(240) NOT NULL, category VARCHAR(100) NOT NULL, artists VARCHAR(1000) NOT NULL DEFAULT '',
      description TEXT NOT NULL, ticketUrl TEXT NOT NULL, imageUrl TEXT NOT NULL,
      published BOOLEAN NOT NULL DEFAULT FALSE, createdAt DATETIME(3) NOT NULL, updatedAt DATETIME(3) NULL,
      INDEX events_date_time (date, startTime)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    const events = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "events.json"), "utf8"));
    let imported = 0;
    for (const event of events) {
      const [result] = await db.execute(`INSERT IGNORE INTO events
        (id,title,date,endDate,startTime,endTime,venue,category,artists,description,ticketUrl,imageUrl,published,createdAt,updatedAt)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [event.id,event.title,event.date,event.endDate || event.date,event.startTime,event.endTime,event.venue,event.category,event.artists || "",event.description || "",event.ticketUrl || "",event.imageUrl || "",Boolean(event.published),event.createdAt ? new Date(event.createdAt) : new Date(),event.updatedAt ? new Date(event.updatedAt) : null]);
      imported += result.affectedRows;
    }
    console.log(`Imported ${imported} event(s); existing IDs were skipped.`);
  } finally {
    await db.end();
  }
}

main().catch(error => { console.error("Import failed:", error.message); process.exitCode = 1; });
