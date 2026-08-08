-- -----------------------------------------------------------------------------
-- DeepLink Pro V2: Mobile Campaign Intelligence Platform Database Foundation
-- Migration: 20260808000000_v2_event_foundation.sql
-- Supports 11 Core Entities: Workspace, User, Domain, Link, Campaign, Click,
-- Telemetry, RiskAssessment, ConversionEvent, Attribution, Subscription
-- Data Tiering: Operational, Short-lived Telemetry, Derived Analytics, Daily Rollups
-- -----------------------------------------------------------------------------

-- 1. Workspace (Multi-tenant boundary)
CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. User
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    workspace_id TEXT REFERENCES workspaces(id) ON DELETE SET NULL,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Subscription
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    workspace_id TEXT UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan_tier TEXT NOT NULL DEFAULT 'free',
    status TEXT NOT NULL DEFAULT 'active',
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Domain
CREATE TABLE IF NOT EXISTS domains (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    domain TEXT UNIQUE NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Campaign
CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Link (Smart Shortlink)
CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
    domain_id TEXT REFERENCES domains(id) ON DELETE SET NULL,
    alias TEXT UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    short_url TEXT NOT NULL,
    target_scheme TEXT,
    fallback_url TEXT,
    qr_code TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Click (Operational Click Log)
CREATE TABLE IF NOT EXISTS clicks (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    link_id TEXT NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    alias TEXT NOT NULL,
    ip TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Unknown',
    city TEXT DEFAULT 'Unknown',
    os TEXT NOT NULL DEFAULT 'Unknown',
    browser TEXT NOT NULL DEFAULT 'Unknown',
    device TEXT NOT NULL DEFAULT 'Desktop',
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast analytics queries
CREATE INDEX IF NOT EXISTS idx_clicks_workspace ON clicks(workspace_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_clicks_link_ts ON clicks(link_id, timestamp DESC);

-- 8. Short-lived Raw Telemetry (Purged periodically after 14 days)
CREATE TABLE IF NOT EXISTS raw_telemetry (
    id TEXT PRIMARY KEY,
    click_id TEXT UNIQUE NOT NULL REFERENCES clicks(id) ON DELETE CASCADE,
    canvas_hash TEXT,
    webgl_vendor TEXT,
    gpu_renderer TEXT,
    screen_resolution TEXT,
    touch_points INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Risk Assessment (Traffic Quality Score 0.00 - 1.00)
CREATE TABLE IF NOT EXISTS risk_assessments (
    id TEXT PRIMARY KEY,
    click_id TEXT UNIQUE NOT NULL REFERENCES clicks(id) ON DELETE CASCADE,
    traffic_quality_score NUMERIC(3, 2) NOT NULL DEFAULT 1.00,
    risk_category TEXT NOT NULL DEFAULT 'Low',
    suspicious_signals TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Conversion Event (Idempotent by workspace_id + order_id + event_name)
CREATE TABLE IF NOT EXISTS conversion_events (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    click_id TEXT REFERENCES clicks(id) ON DELETE SET NULL,
    link_id TEXT REFERENCES links(id) ON DELETE SET NULL,
    event_name TEXT NOT NULL,
    order_id TEXT,
    value NUMERIC(12, 2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    idempotency_key TEXT UNIQUE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversions_workspace ON conversion_events(workspace_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_conversions_link ON conversion_events(link_id, timestamp DESC);

-- 11. Attribution (Derived Analytics)
CREATE TABLE IF NOT EXISTS attributions (
    id TEXT PRIMARY KEY,
    conversion_id TEXT UNIQUE NOT NULL REFERENCES conversion_events(id) ON DELETE CASCADE,
    click_id TEXT NOT NULL REFERENCES clicks(id) ON DELETE CASCADE,
    campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
    touch_type TEXT NOT NULL DEFAULT 'last_touch',
    attributed_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Aggregated Historical Metrics (Long-term rollup storage)
CREATE TABLE IF NOT EXISTS daily_campaign_metrics (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    link_id TEXT NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    total_clicks INT NOT NULL DEFAULT 0,
    human_clicks INT NOT NULL DEFAULT 0,
    suspicious_clicks INT NOT NULL DEFAULT 0,
    conversions INT NOT NULL DEFAULT 0,
    total_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    UNIQUE(link_id, metric_date)
);
