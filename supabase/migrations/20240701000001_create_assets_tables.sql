-- Create asset_categories table
CREATE TABLE IF NOT EXISTS public.asset_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.asset_categories(id),
    name TEXT NOT NULL,
    description TEXT,
    value DECIMAL(18, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    acquisition_date TIMESTAMP WITH TIME ZONE,
    acquisition_value DECIMAL(18, 2),
    location TEXT,
    notes TEXT,
    is_liability BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create asset_history table for tracking value changes
CREATE TABLE IF NOT EXISTS public.asset_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    value DECIMAL(18, 2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default asset categories
INSERT INTO public.asset_categories (name, slug, icon, description)
VALUES 
    ('Cash', 'cash', 'dollar-sign', 'Bank accounts, savings, and liquid assets'),
    ('Investments', 'investments', 'landmark', 'Stocks, bonds, ETFs, and mutual funds'),
    ('Real Estate', 'real-estate', 'home', 'Properties, mortgages, and REITs'),
    ('Cryptocurrency', 'cryptocurrency', 'coins', 'Bitcoin, Ethereum, and other digital assets'),
    ('Debt', 'debt', 'credit-card', 'Credit cards, loans, and liabilities')
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS on assets table
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own assets
DROP POLICY IF EXISTS "Users can only see their own assets" ON public.assets;
CREATE POLICY "Users can only see their own assets"
    ON public.assets
    FOR ALL
    USING (auth.uid() = user_id);

-- Enable RLS on asset_history table
ALTER TABLE public.asset_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own asset history
DROP POLICY IF EXISTS "Users can only see their own asset history" ON public.asset_history;
CREATE POLICY "Users can only see their own asset history"
    ON public.asset_history
    FOR ALL
    USING ((SELECT user_id FROM public.assets WHERE id = asset_id) = auth.uid());

-- Add realtime support
alter publication supabase_realtime add table public.assets;
alter publication supabase_realtime add table public.asset_history;
