-- Create a new broker_connections table with improved structure
CREATE TABLE IF NOT EXISTS broker_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  broker_id TEXT NOT NULL,
  api_key TEXT,
  api_secret_encrypted TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  broker_data JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, broker_id)
);

-- Add RLS policies
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own connections
CREATE POLICY "Users can view their own broker connections"
  ON broker_connections FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own connections
CREATE POLICY "Users can insert their own broker connections"
  ON broker_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own connections
CREATE POLICY "Users can update their own broker connections"
  ON broker_connections FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own connections
CREATE POLICY "Users can delete their own broker connections"
  ON broker_connections FOR DELETE
  USING (auth.uid() = user_id);
