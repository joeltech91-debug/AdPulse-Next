-- AdPulse Next bootstrap for a COPY/STAGING database only.
-- Existing user_Tracker_Link and link_Tracker_Link tables are retained as-is.
-- Run only after checking whether these tables already exist.
CREATE TABLE IF NOT EXISTS user_subscriptions (
  user_id VARCHAR(255) NOT NULL PRIMARY KEY,
  plan VARCHAR(24) NOT NULL DEFAULT 'free',
  status VARCHAR(24) NOT NULL DEFAULT 'active',
  links_limit INT NOT NULL DEFAULT 1,
  clicks_limit BIGINT NOT NULL DEFAULT 30,
  clicks_used BIGINT NOT NULL DEFAULT 0,
  analytics_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  period_started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_subscription_expiry (status, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pending_subscription_payments (
  cart_id VARCHAR(255) NOT NULL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  plan VARCHAR(24) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pending_subscription_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tracker_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  slug VARCHAR(250) NOT NULL,
  event_type VARCHAR(24) NOT NULL,
  event_name VARCHAR(80) NOT NULL DEFAULT '',
  event_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT '',
  visitor_hash CHAR(64) NOT NULL,
  ip_hash CHAR(64) NOT NULL,
  user_agent VARCHAR(512) NOT NULL DEFAULT '',
  referrer TEXT,
  utm_source VARCHAR(160) NOT NULL DEFAULT '',
  utm_medium VARCHAR(160) NOT NULL DEFAULT '',
  utm_campaign VARCHAR(160) NOT NULL DEFAULT '',
  is_bot BOOLEAN NOT NULL DEFAULT FALSE,
  is_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tracker_events_user_date (user_id, created_at),
  INDEX idx_tracker_events_user_type_date (user_id, event_type, created_at),
  INDEX idx_tracker_events_slug_date (slug, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
