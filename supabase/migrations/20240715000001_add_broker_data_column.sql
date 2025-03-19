-- Add broker_data column to assets table
ALTER TABLE assets ADD COLUMN IF NOT EXISTS broker_data JSONB;
