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
  priority TEXT NOT NULL DEFAULT 'normal',
  follow_up_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at
  ON contact_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_contact_requests_follow_up_at
  ON contact_requests(follow_up_at);

CREATE INDEX IF NOT EXISTS idx_contact_requests_priority
  ON contact_requests(priority);


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


-- Administratives Audit-Log: keine Passwörter, Tokens oder Formulardaten.
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_email TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  area TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
ON audit_log(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor_area
ON audit_log(actor_email, area);


-- Versionierung der CMS-Inhalte: speichert jeweils den vorherigen Wert vor Änderungen/Löschungen.
CREATE TABLE IF NOT EXISTS content_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  operation TEXT NOT NULL,
  actor_email TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_history_key_id
ON content_history(key, id DESC);

CREATE INDEX IF NOT EXISTS idx_content_history_created_at
ON content_history(created_at);


-- Redaktionelle Entwürfe: werden erst über den geschützten Publish-Endpunkt in content übernommen.
CREATE TABLE IF NOT EXISTS content_drafts (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  actor_email TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_drafts_updated_at
ON content_drafts(updated_at);
