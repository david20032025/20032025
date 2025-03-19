-- Add additional fields to assets table for broker data
ALTER TABLE assets ADD COLUMN IF NOT EXISTS broker_data JSONB;
