-- Add package_weight_grams column to spices table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'spices' AND column_name = 'package_weight_grams'
  ) THEN
    ALTER TABLE spices ADD COLUMN package_weight_grams INTEGER DEFAULT 50;
  END IF;
END $$;

-- Create chapel_deliveries table for special Sunday deliveries
CREATE TABLE IF NOT EXISTS chapel_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  delivery_date DATE NOT NULL,
  chapel_name TEXT NOT NULL DEFAULT 'A Igreja de Jesus Cristo dos Santos dos Últimos Dias',
  chapel_cep TEXT NOT NULL DEFAULT '04678-000',
  total_weight_grams INTEGER NOT NULL,
  items JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE chapel_deliveries ENABLE ROW LEVEL SECURITY;

-- Policies for chapel_deliveries
-- Users can view their own chapel delivery requests
CREATE POLICY "Users can view own chapel deliveries" ON chapel_deliveries
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create chapel delivery requests
CREATE POLICY "Users can create chapel deliveries" ON chapel_deliveries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all chapel deliveries (using user metadata)
CREATE POLICY "Admins can view all chapel deliveries" ON chapel_deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Admins can update chapel deliveries
CREATE POLICY "Admins can update chapel deliveries" ON chapel_deliveries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chapel_deliveries_status ON chapel_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_chapel_deliveries_delivery_date ON chapel_deliveries(delivery_date);
CREATE INDEX IF NOT EXISTS idx_chapel_deliveries_user_id ON chapel_deliveries(user_id);
