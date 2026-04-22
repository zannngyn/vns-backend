-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector column to product_embeddings table
-- Gemini text-embedding-004 outputs 768 dimensions
ALTER TABLE product_embeddings
  ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS idx_product_embeddings_vector
  ON product_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);
