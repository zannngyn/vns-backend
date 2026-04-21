-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector column to product_embeddings
ALTER TABLE product_embeddings
ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS idx_product_embeddings_vector
ON product_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create full-text search index on products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(description, '')), 'B')
) STORED;

CREATE INDEX IF NOT EXISTS idx_products_search
ON products USING gin(search_vector);
