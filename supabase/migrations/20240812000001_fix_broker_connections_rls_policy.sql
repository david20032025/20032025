-- Disable RLS for broker_connections table to allow service role access
ALTER TABLE broker_connections DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to service_role
GRANT ALL ON broker_connections TO service_role;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON broker_connections TO authenticated;
