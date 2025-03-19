-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can only access their own connections" ON broker_connections;
DROP POLICY IF EXISTS "Service role has full access" ON broker_connections;

-- Enable RLS on the table
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access only their own connections
CREATE POLICY "Users can only access their own connections"
ON broker_connections
FOR ALL
USING (auth.uid() = user_id);

-- Create policy for service role to have full access
CREATE POLICY "Service role has full access"
ON broker_connections
FOR ALL
TO service_role
USING (true);

-- Remove the ALTER PUBLICATION line since the table is already in the publication
