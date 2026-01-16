-- ==============================================================================
-- SMART CLASSROOM AI - QR Tokens Table Migration
-- Creates table for QR attendance verification tokens
-- ==============================================================================

-- TABLE: qr_tokens
-- Stores temporary tokens for QR-based attendance verification
CREATE TABLE IF NOT EXISTS qr_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(64) UNIQUE NOT NULL,
    class_id VARCHAR(100) NOT NULL,
    period_number INTEGER NOT NULL DEFAULT 1,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_period CHECK (period_number >= 1 AND period_number <= 10)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS ix_qr_tokens_token ON qr_tokens(token);
CREATE INDEX IF NOT EXISTS ix_qr_tokens_class_id ON qr_tokens(class_id);
CREATE INDEX IF NOT EXISTS ix_qr_tokens_active ON qr_tokens(is_active) WHERE is_active = true;

-- ==============================================================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- ==============================================================================
