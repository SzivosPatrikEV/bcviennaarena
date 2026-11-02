-- The database shown in phpMyAdmin is bcvienna_bcviennaarena.
-- Select that database in phpMyAdmin before running this file.
CREATE TABLE IF NOT EXISTS events (
  id CHAR(36) NOT NULL PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  `date` DATE NOT NULL,
  endDate DATE NOT NULL,
  startTime CHAR(5) NOT NULL,
  endTime CHAR(5) NOT NULL,
  venue VARCHAR(240) NOT NULL,
  category VARCHAR(100) NOT NULL,
  artists VARCHAR(1000) NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  ticketUrl TEXT NOT NULL,
  imageUrl TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt DATETIME(3) NOT NULL,
  updatedAt DATETIME(3) NULL,
  INDEX events_date_time (`date`, startTime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
