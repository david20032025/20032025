-- Drop the existing policy first to avoid conflicts
DROP POLICY IF EXISTS "Users can manage their own broker connections" ON broker_connections;

-- Create a new policy that allows users to insert, select, update, and delete their own connections
CREATE POLICY "Users can manage their own broker connections"
ON broker_connections
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Make sure RLS is enabled
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;

-- Add a policy to allow service role to access all rows
DROP POLICY IF EXISTS "Service role can manage all broker connections" ON broker_connections;
CREATE POLICY "Service role can manage all broker connections"
ON broker_connections
FOR ALL
TO service_role
USING (true);
