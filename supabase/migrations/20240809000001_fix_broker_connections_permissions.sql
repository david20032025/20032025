-- Grant all permissions on broker_connections to both authenticated users and service_role
GRANT ALL ON broker_connections TO authenticated;
GRANT ALL ON broker_connections TO service_role;

-- Ensure the RLS policy allows service_role to access all rows
DROP POLICY IF EXISTS "Service role can access all broker connections" ON broker_connections;
CREATE POLICY "Service role can access all broker connections"
  ON broker_connections
  FOR ALL
  TO service_role
  USING (true);

-- Ensure authenticated users can only access their own connections
DROP POLICY IF EXISTS "Users can only access their own broker connections" ON broker_connections;
CREATE POLICY "Users can only access their own broker connections"
  ON broker_connections
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);
