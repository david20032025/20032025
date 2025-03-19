-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Users can manage their own broker connections" ON broker_connections;

-- Create a policy that allows users to manage their own broker connections
CREATE POLICY "Users can manage their own broker connections"
ON broker_connections
FOR ALL
USING (auth.uid() = user_id);

-- Enable RLS on the broker_connections table
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows service role to manage all broker connections
DROP POLICY IF EXISTS "Service role can manage all broker connections" ON broker_connections;
CREATE POLICY "Service role can manage all broker connections"
ON broker_connections
FOR ALL
TO service_role
USING (true);
