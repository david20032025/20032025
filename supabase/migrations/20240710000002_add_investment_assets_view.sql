-- Create a view for investment assets with broker details
CREATE OR REPLACE VIEW investment_assets AS
SELECT 
  a.id,
  a.user_id,
  a.name AS asset_name,
  a.value AS current_value,
  a.acquisition_value AS purchase_value,
  a.location AS broker_name,
  (a.metadata->>'quantity')::NUMERIC AS quantity,
  (a.metadata->>'price_per_share')::NUMERIC AS current_price,
  (a.metadata->>'purchase_price')::NUMERIC AS purchase_price,
  a.metadata->>'symbol' AS symbol,
  a.metadata->>'account_name' AS account_name,
  a.metadata->>'asset_type' AS asset_type,
  a.created_at,
  a.updated_at
FROM assets a
WHERE a.metadata->>'source' = 'snaptrade';

-- Enable row level security
ALTER TABLE investment_assets ENABLE ROW LEVEL SECURITY;

-- Create policy to only allow users to see their own investment assets
DROP POLICY IF EXISTS "Users can only view their own investment assets" ON investment_assets;
CREATE POLICY "Users can only view their own investment assets"
  ON investment_assets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Add realtime for assets table
ALTER PUBLICATION supabase_realtime ADD TABLE assets;
