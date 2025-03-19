-- Update broker_connections table to better support SnapTrade
ALTER TABLE IF EXISTS broker_connections
  ADD COLUMN IF NOT EXISTS broker_data JSONB;

-- Create index on user_id and broker_id for faster lookups
CREATE INDEX IF NOT EXISTS broker_connections_user_broker_idx ON broker_connections (user_id, broker_id);

-- Enable realtime for broker_connections table
ALTER PUBLICATION supabase_realtime ADD TABLE broker_connections;
