-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own broker connections" ON broker_connections;
DROP POLICY IF EXISTS "Users can insert their own broker connections" ON broker_connections;
DROP POLICY IF EXISTS "Users can update their own broker connections" ON broker_connections;
DROP POLICY IF EXISTS "Users can delete their own broker connections" ON broker_connections;
DROP POLICY IF EXISTS "Service role has full access to broker_connections" ON broker_connections;

-- Disable RLS temporarily to ensure we can modify the table
ALTER TABLE broker_connections DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;

-- Create policies with proper conditions
CREATE POLICY "Users can view their own broker connections"
ON broker_connections
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own broker connections"
ON broker_connections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own broker connections"
ON broker_connections
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own broker connections"
ON broker_connections
FOR DELETE
USING (auth.uid() = user_id);

-- Create a policy for the service role to have full access
CREATE POLICY "Service role has full access to broker_connections"
ON broker_connections
FOR ALL
TO service_role
USING (true);

-- Ensure the table is part of the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE broker_connections;