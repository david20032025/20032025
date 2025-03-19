-- Drop existing RLS policies for broker_connections table
DROP POLICY IF EXISTS "Users can view their own broker connections" ON broker_connections;
DROP POLICY IF EXISTS "Users can insert their own broker connections" ON broker_connections;
DROP POLICY IF EXISTS "Users can update their own broker connections" ON broker_connections;
DROP POLICY IF EXISTS "Users can delete their own broker connections" ON broker_connections;

-- Create new RLS policies for broker_connections table
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

-- Enable row level security
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;
