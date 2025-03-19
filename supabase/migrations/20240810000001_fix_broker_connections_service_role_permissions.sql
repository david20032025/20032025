-- Grant all privileges on broker_connections table to the service role
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

-- Create policy for service role to have full access
CREATE POLICY "Service role has full access to broker_connections"
ON broker_connections
USING (auth.jwt() ? 'service_role' :: text);

-- Grant all privileges to authenticated users
GRANT ALL ON broker_connections TO authenticated;

-- Grant all privileges to service_role
GRANT ALL ON broker_connections TO service_role;