-- Fix broker connections service role access

-- First, drop any existing policies
DROP POLICY IF EXISTS "Service role can access all broker connections" ON broker_connections;

-- Force row level security
ALTER TABLE broker_connections FORCE ROW LEVEL SECURITY;

-- Create policy for service role
CREATE POLICY "Service role can access all broker connections" 
ON broker_connections 
FOR ALL 
USING (true);

-- Grant permissions to service role
GRANT ALL ON broker_connections TO service_role;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE broker_connections;
