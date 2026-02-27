-- Enable UUID extension for Supabase/PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Tables (matching README / TypeORM entities)
-- =============================================

-- Receivers: people who receive transactions
CREATE TABLE receivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Currencies: USD, IRR, INR
CREATE TABLE currencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(3) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL
);

-- Transactions: linked to receiver and currency
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(255) NOT NULL UNIQUE,
  receiver_id UUID NOT NULL REFERENCES receivers(id) ON DELETE CASCADE,
  "to" VARCHAR(255) NOT NULL,
  amount DECIMAL(18, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  payment_method VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries (align with TypeORM @Index)
CREATE INDEX idx_transactions_currency ON transactions(currency);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_receiver_id ON transactions(receiver_id);

-- =============================================
-- Dummy data (receivers like Ali, currencies, transactions)
-- =============================================

-- Currencies
INSERT INTO currencies (id, code, name) VALUES
  (uuid_generate_v4(), 'USD', 'US Dollar'),
  (uuid_generate_v4(), 'IRR', 'Iranian Rial'),
  (uuid_generate_v4(), 'INR', 'Indian Rupee')
ON CONFLICT (code) DO NOTHING;

-- Receivers (including Ali and others)
INSERT INTO receivers (id, name, email) VALUES
  (uuid_generate_v4(), 'Ali Hassan', 'ali@example.com'),
  (uuid_generate_v4(), 'Sara Ahmed', 'sara@example.com'),
  (uuid_generate_v4(), 'Omar Khan', 'omar@example.com'),
  (uuid_generate_v4(), 'Fatima Ali', 'fatima@example.com'),
  (uuid_generate_v4(), 'Yusuf Ibrahim', 'yusuf@example.com')
ON CONFLICT (email) DO NOTHING;

-- Dummy transactions (only if no transactions exist yet)
INSERT INTO transactions (reference_number, receiver_id, "to", amount, currency, payment_method, status)
SELECT
  'TXN-' || to_char(now(), 'YYYYMMDD') || '-' || n::text,
  (SELECT id FROM receivers ORDER BY created_at LIMIT 1 OFFSET (n % 5)),
  CASE (n % 3) WHEN 0 THEN 'Bank Transfer' WHEN 1 THEN 'Wallet' ELSE 'Card' END,
  (100.00 + (n * 15.50)),
  (ARRAY['USD', 'IRR', 'INR'])[1 + (n % 3)],
  CASE (n % 2) WHEN 0 THEN 'wire' ELSE 'card' END,
  (ARRAY['pending', 'approved'])[1 + (n % 2)]
FROM generate_series(1, 8) AS n
WHERE (SELECT count(*) FROM transactions) = 0;
