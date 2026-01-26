-- Initialize pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create note_embeddings table
CREATE TABLE IF NOT EXISTS note_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL UNIQUE,
    embedding vector(1536),  -- OpenAI text-embedding-3-small produces 1536-dimensional vectors
    content_hash VARCHAR(64),  -- SHA-256 hash to detect content changes
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for similarity search using cosine distance
CREATE INDEX IF NOT EXISTS note_embeddings_vector_idx
ON note_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index on note_id for lookups
CREATE INDEX IF NOT EXISTS note_embeddings_note_id_idx
ON note_embeddings (note_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_note_embeddings_updated_at
BEFORE UPDATE ON note_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
