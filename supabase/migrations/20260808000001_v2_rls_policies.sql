-- -----------------------------------------------------------------------------
-- DeepLink Pro V2: P0-3 Row Level Security (RLS) Policy Migration
-- Migration: 20260808000001_v2_rls_policies.sql
-- Enforces strict workspace-scoped RLS policies across all 11 core tables
-- -----------------------------------------------------------------------------

-- Enable RLS on all 11 core entities
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_campaign_metrics ENABLE ROW LEVEL SECURITY;

-- Helper function to extract user workspace ID from JWT
CREATE OR REPLACE FUNCTION current_user_workspace_id()
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'workspaceId', '');
$$ LANGUAGE SQL STABLE;

-- 1. Workspaces Policy
CREATE POLICY workspace_member_access ON workspaces
    FOR ALL
    USING (id = current_user_workspace_id());

-- 2. Users Policy
CREATE POLICY user_workspace_access ON users
    FOR ALL
    USING (workspace_id = current_user_workspace_id());

-- 3. Subscriptions Policy
CREATE POLICY subscription_workspace_access ON subscriptions
    FOR ALL
    USING (workspace_id = current_user_workspace_id());

-- 4. Domains Policy
CREATE POLICY domain_workspace_access ON domains
    FOR ALL
    USING (workspace_id = current_user_workspace_id());

-- 5. Campaigns Policy
CREATE POLICY campaign_workspace_access ON campaigns
    FOR ALL
    USING (workspace_id = current_user_workspace_id());

-- 6. Links Policy
CREATE POLICY link_workspace_access ON links
    FOR ALL
    USING (workspace_id = current_user_workspace_id());

-- Public shortlink resolution bypass policy for active links
CREATE POLICY public_link_resolution ON links
    FOR SELECT
    USING (is_active = TRUE);

-- 7. Clicks Policy
CREATE POLICY click_workspace_access ON clicks
    FOR ALL
    USING (workspace_id = current_user_workspace_id());

-- 8. Raw Telemetry Policy
CREATE POLICY raw_telemetry_access ON raw_telemetry
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM clicks
            WHERE clicks.id = raw_telemetry.click_id
            AND clicks.workspace_id = current_user_workspace_id()
        )
    );

-- 9. Risk Assessment Policy
CREATE POLICY risk_assessment_access ON risk_assessments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM clicks
            WHERE clicks.id = risk_assessments.click_id
            AND clicks.workspace_id = current_user_workspace_id()
        )
    );

-- 10. Conversion Events Policy
CREATE POLICY conversion_event_workspace_access ON conversion_events
    FOR ALL
    USING (workspace_id = current_user_workspace_id());

-- 11. Attributions Policy
CREATE POLICY attribution_workspace_access ON attributions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM conversion_events
            WHERE conversion_events.id = attributions.conversion_id
            AND conversion_events.workspace_id = current_user_workspace_id()
        )
    );

-- 12. Daily Campaign Metrics Policy
CREATE POLICY daily_metrics_workspace_access ON daily_campaign_metrics
    FOR ALL
    USING (workspace_id = current_user_workspace_id());
