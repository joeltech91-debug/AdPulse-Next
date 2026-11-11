-- AdPulse: geographic metadata for click events.
-- Run once against the MySQL database before deploying this feature.
ALTER TABLE tracker_events
  ADD COLUMN geo_country_code CHAR(2) NULL,
  ADD COLUMN geo_country_name VARCHAR(100) NULL,
  ADD COLUMN geo_continent_code CHAR(2) NULL;

CREATE INDEX idx_tracker_events_user_geo
  ON tracker_events (user_id, event_type, is_bot, is_duplicate, geo_country_code);
