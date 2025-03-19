CREATE TABLE IF NOT EXISTS broker_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  broker_id TEXT NOT NULL,
  api_key TEXT NOT NULL,
  api_secret_encrypted TEXT NOT NULL,
  broker_data JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own connections
DROP POLICY IF EXISTS "Users can only view their own broker connections" ON broker_connections;
CREATE POLICY "Users can only view their own broker connections"
  ON broker_connections FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to only insert their own connections
DROP POLICY IF EXISTS "Users can only insert their own broker connections" ON broker_connections;
CREATE POLICY "Users can only insert their own broker connections"
  ON broker_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to only update their own connections
DROP POLICY IF EXISTS "Users can only update their own broker connections" ON broker_connections;
CREATE POLICY "Users can only update their own broker connections"
  ON broker_connections FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow users to only delete their own connections
DROP POLICY IF EXISTS "Users can only delete their own broker connections" ON broker_connections;
CREATE POLICY "Users can only delete their own broker connections"
  ON broker_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Add to realtime publication
alter publication supabase_realtime add table broker_connections;
