-- Bypass RLS for the service role on broker_connections table
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own broker connections" ON broker_connections;
DROP POLICY IF EXISTS "Users can insert their own broker connections" ON broker_connections;
DROP POLICY IF EXISTS "Users can update their own broker connections" ON broker_connections;
DROP POLICY IF EXISTS "Users can delete their own broker connections" ON broker_connections;
DROP POLICY IF EXISTS "Service role has full access to broker_connections" ON broker_connections;

-- Create policies for user access
CREATE POLICY "Users can view their own broker connections"
  ON broker_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own broker connections"
  ON broker_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own broker connections"
  ON broker_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own broker connections"
  ON broker_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Grant service role bypass RLS permission
CREATE POLICY "Service role has full access to broker_connections"
  ON broker_connections
  USING (auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

-- Grant the service role explicit permissions on the table
GRANT ALL ON broker_connections TO service_role;

-- Ensure the authenticated role has appropriate permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON broker_connections TO authenticated;
