-- Drop the broker_connections table if it exists
DROP TABLE IF EXISTS broker_connections;

-- Remove any SnapTrade related data from assets table
UPDATE assets
SET metadata = metadata - 'source'
WHERE metadata->>'source' = 'snaptrade';
