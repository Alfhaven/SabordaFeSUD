-- Create spices table
CREATE TABLE IF NOT EXISTS spices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  weight_grams INTEGER NOT NULL DEFAULT 50,
  package_weight_grams INTEGER DEFAULT 50,
  image_url TEXT,
  available BOOLEAN DEFAULT TRUE,
  stock INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on spices
ALTER TABLE spices ENABLE ROW LEVEL SECURITY;

-- Anyone can view available spices
CREATE POLICY "Anyone can view spices" ON spices
  FOR SELECT USING (TRUE);

-- Admins can manage spices
CREATE POLICY "Admins can insert spices" ON spices
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE POLICY "Admins can update spices" ON spices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE POLICY "Admins can delete spices" ON spices
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spice_id UUID NOT NULL REFERENCES spices(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, spice_id)
);

-- Enable RLS on cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users can manage their own cart
CREATE POLICY "Users can view own cart" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to cart" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from cart" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  delivery_type TEXT NOT NULL DEFAULT 'normal' CHECK (delivery_type IN ('normal', 'chapel')),
  delivery_address JSONB,
  items JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Admins can update orders
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );

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

-- Enable RLS on chapel_deliveries
ALTER TABLE chapel_deliveries ENABLE ROW LEVEL SECURITY;

-- Users can view their own chapel delivery requests
CREATE POLICY "Users can view own chapel deliveries" ON chapel_deliveries
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create chapel delivery requests
CREATE POLICY "Users can create chapel deliveries" ON chapel_deliveries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all chapel deliveries
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_chapel_deliveries_status ON chapel_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_chapel_deliveries_delivery_date ON chapel_deliveries(delivery_date);
CREATE INDEX IF NOT EXISTS idx_chapel_deliveries_user_id ON chapel_deliveries(user_id);
