-- Grant the service role permission to bypass RLS
ALTER TABLE broker_connections FORCE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can only access their own broker connections" ON broker_connections;
DROP POLICY IF EXISTS "Service role can access all broker connections" ON broker_connections;

-- Create policy for users to only see their own connections
CREATE POLICY "Users can only access their own broker connections"
ON broker_connections
USING (auth.uid() = user_id);

-- Create policy for service role to access all connections
CREATE POLICY "Service role can access all broker connections"
ON broker_connections
FOR ALL
USING (true);

-- Ensure the table is in the realtime publication (this line is commented out since it's already a member)
-- ALTER PUBLICATION supabase_realtime ADD TABLE broker_connections;
