-- Idempotentes Basisschema: nur CREATE ... IF NOT EXISTS, keine destruktiven Migrationen.
-- Bestehende Daten bleiben erhalten. Additive Altbestandsmigrationen (aktuell
-- internal_note in contact_requests) prüft der Worker per PRAGMA und ergänzt sie nur,
-- wenn die Spalte tatsächlich fehlt.

CREATE TABLE IF NOT EXISTS content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_updated_at
  ON content(updated_at);


CREATE TABLE IF NOT EXISTS contact_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT '/',
  status TEXT NOT NULL DEFAULT 'neu',
  internal_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at
  ON contact_requests(created_at);


-- Datenschutzfreundliche, anonyme Website-KPI-Ereignisse.
-- Keine IP-Adresse, keine Cookie-/Besucher-ID, kein User-Agent und keine Formulardaten.
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  page_path TEXT NOT NULL DEFAULT '/',
  target TEXT NOT NULL DEFAULT '',
  event_label TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at
ON analytics_events(created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_type_path
ON analytics_events(event_type, page_path);
