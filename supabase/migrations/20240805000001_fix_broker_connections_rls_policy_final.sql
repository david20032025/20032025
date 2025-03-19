-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own broker connections" ON broker_connections;
DROP POLICY IF EXISTS "Users can insert their own broker connections" ON broker_connections;
DROP POLICY IF EXISTS "Users can update their own broker connections" ON broker_connections;
DROP POLICY IF EXISTS "Users can delete their own broker connections" ON broker_connections;
DROP POLICY IF EXISTS "Service role can access all broker connections" ON broker_connections;

-- Temporarily disable RLS to ensure we can make changes
ALTER TABLE broker_connections DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
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

-- Create a policy for service role access (fixed syntax)
CREATE POLICY "Service role can access all broker connections"
ON broker_connections
FOR ALL
USING (auth.jwt() IS NOT NULL AND auth.jwt() ->> 'role' = 'service_role');
