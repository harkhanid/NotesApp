# Semantic Search Implementation

This document describes the semantic search functionality added to NotesApp using OpenAI embeddings and pgvector.

## Overview

The semantic search feature provides intelligent note search using vector embeddings, allowing users to find notes based on conceptual similarity rather than just keyword matching. The implementation uses a hybrid approach combining both keyword and semantic search for optimal results.

## Architecture

### Components

1. **PostgreSQL with pgvector** - Separate vector database for storing note embeddings
2. **OpenAI Embeddings API** - Generates 1536-dimensional vectors using `text-embedding-3-small` model
3. **Hybrid Search Service** - Combines keyword and semantic search with weighted ranking
4. **Auto-embedding Generation** - Automatic embedding generation on note create/update

### Data Flow

```
Note Creation/Update
    ↓
NoteService hooks
    ↓
PGVectorSearchService.upsertNoteEmbedding()
    ↓
OpenAIEmbeddingService.generateNoteEmbedding()
    ↓
OpenAI API (text-embedding-3-small)
    ↓
NoteEmbeddingRepository.save()
    ↓
PostgreSQL pgvector database
```

```
Search Query
    ↓
HybridSearchService.hybridSearch()
    ├─→ NoteRepository.searchNotesByKeyword() (MySQL)
    └─→ PGVectorSearchService.semanticSearch()
        ├─→ OpenAIEmbeddingService.generateEmbedding() (query)
        └─→ NoteEmbeddingRepository.findSimilarNotes() (pgvector)
    ↓
Combine & rank results
    ↓
Return sorted results
```

## Setup

### 1. Start PostgreSQL with pgvector

```bash
# Start the Docker container
docker-compose -f docker-compose.pgvector.yml up -d

# Verify it's running
docker ps | grep pgvector
```

The PostgreSQL database will be available at `localhost:5433` with:
- Database: `notesapp_vectors`
- Username: `pgvector_user`
- Password: `pgvector_dev_password`

### 2. Configure Environment Variables

Add the following environment variables:

```bash
# OpenAI API Key (required)
export OPENAI_API_KEY="sk-your-openai-api-key"

# PGVector Database (optional, defaults provided)
export PGVECTOR_DATABASE_URL="jdbc:postgresql://localhost:5433/notesapp_vectors"
export PGVECTOR_DATABASE_USERNAME="pgvector_user"
export PGVECTOR_DATABASE_PASSWORD="pgvector_dev_password"
```

### 3. Run the Application

```bash
cd notes
./mvnw spring-boot:run
```

### 4. Generate Embeddings for Existing Notes

After starting the application, run the migration endpoint to generate embeddings for all existing notes:

```bash
curl -X POST http://localhost:8080/api/admin/embeddings/migrate \
  -H "Authorization: Bearer <admin-jwt-token>"
```

**Note:** This endpoint requires admin role. You need to be authenticated as an admin user.

## API Endpoints

### Search Endpoints

#### Hybrid Search (Default)
```http
GET /api/notes/search?keyword=machine learning
```

Combines keyword and semantic search with weighted ranking:
- Keyword weight: 30%
- Semantic weight: 70%
- Results are deduplicated and ranked by combined score

#### Keyword-Only Search
```http
GET /api/notes/search?keyword=machine learning&mode=keyword
```

Uses traditional keyword matching only.

### User Embedding Endpoints

These endpoints allow users to manage embeddings for their own notes. All endpoints require user authentication.

#### Regenerate Single Note Embedding
```http
POST /api/notes/{noteId}/embeddings/regenerate
```

Regenerate the embedding for a specific note. The user must own the note or have edit access.

**Response:**
```json
{
  "success": true,
  "message": "Embedding regenerated successfully",
  "noteId": "note-uuid"
}
```

**Use cases:**
- Embedding generation failed during note creation/update
- Force refresh after note content changes
- Troubleshooting search issues

#### Regenerate All User Notes
```http
POST /api/notes/embeddings/regenerate-all
```

Regenerate embeddings for all notes owned by the current user. This only affects notes the user owns, not shared notes.

**Response:**
```json
{
  "success": true,
  "message": "Embedding regeneration completed",
  "totalNotes": 25,
  "processedNotes": 25,
  "successCount": 25,
  "failureCount": 0
}
```

**Use cases:**
- Bulk regeneration after system updates
- Fix missing embeddings for user's notes
- Migration for new users

#### Check Note Embedding Status
```http
GET /api/notes/{noteId}/embeddings/status
```

Check if a specific note has an embedding. The user must own the note or have edit access.

**Response:**
```json
{
  "success": true,
  "noteId": "note-uuid",
  "hasEmbedding": true,
  "message": "Note has an embedding"
}
```

**Use cases:**
- Verify embedding exists before searching
- Troubleshooting search issues
- Monitoring embedding coverage

### Admin Endpoints

All admin endpoints require `ROLE_ADMIN` authentication.

#### Migrate All Embeddings
```http
POST /api/admin/embeddings/migrate
```

Generate embeddings for all notes that don't have them yet. Response:
```json
{
  "status": "completed",
  "totalNotes": 150,
  "successCount": 148,
  "failureCount": 2
}
```

#### Regenerate Specific Embeddings
```http
POST /api/admin/embeddings/regenerate
Content-Type: application/json

[
  "note-uuid-1",
  "note-uuid-2"
]
```

Force regeneration of embeddings for specific notes.

#### Get Embedding Statistics
```http
GET /api/admin/embeddings/stats
```

Returns statistics about embeddings in the system.

## Configuration

### Application Properties

Default configuration in `application.properties`:

```properties
# OpenAI Configuration
openai.api.key=${OPENAI_API_KEY:}
openai.api.url=https://api.openai.com/v1
openai.embedding.model=text-embedding-3-small
openai.embedding.dimensions=1536

# PGVector Database Configuration
pgvector.datasource.url=${PGVECTOR_DATABASE_URL:jdbc:postgresql://localhost:5433/notesapp_vectors}
pgvector.datasource.username=${PGVECTOR_DATABASE_USERNAME:pgvector_user}
pgvector.datasource.password=${PGVECTOR_DATABASE_PASSWORD:pgvector_dev_password}
```

### Hybrid Search Parameters

Configurable in `HybridSearchService.java`:

```java
private static final double KEYWORD_WEIGHT = 0.3;      // 30% weight for keyword matches
private static final double SEMANTIC_WEIGHT = 0.7;     // 70% weight for semantic similarity
private static final double SEMANTIC_THRESHOLD = 0.65; // Minimum similarity score (0-1)
```

## How It Works

### Embedding Generation

When a note is created or updated:

1. **Content Hashing**: SHA-256 hash is calculated from title + content
2. **Change Detection**: If hash matches existing embedding, skip generation
3. **Text Preparation**: HTML tags are stripped, title and content are combined
4. **OpenAI API Call**: Text is sent to `text-embedding-3-small` model
5. **Vector Storage**: 1536-dimensional vector is stored in pgvector database

### Semantic Search

When a user searches:

1. **Query Embedding**: Search query is converted to embedding vector
2. **Similarity Search**: pgvector performs cosine similarity search
3. **Authorization Filter**: Results are filtered to user-accessible notes only
4. **Threshold Filter**: Only results above similarity threshold (0.65) are returned
5. **Ranking**: Results are ranked by similarity score

### Hybrid Search

Hybrid search combines both approaches:

1. **Parallel Execution**: Keyword and semantic searches run concurrently
2. **Score Combination**:
   - Notes in keyword results only: score = 0.3
   - Notes in semantic results only: score = 0.7 × similarity
   - Notes in both: score = 0.3 + (0.7 × similarity)
3. **Ranking**: Combined results sorted by score (descending)

## Database Schema

### pgvector Database

```sql
CREATE TABLE note_embeddings (
    id UUID PRIMARY KEY,
    note_id UUID NOT NULL UNIQUE,
    embedding vector(1536),
    content_hash VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX note_embeddings_vector_idx
ON note_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

The `ivfflat` index uses inverted file with flat compression for fast approximate nearest neighbor search.

## Performance Considerations

### Cost Optimization

- **OpenAI API Costs**: `text-embedding-3-small` costs ~$0.02 per 1M tokens
- **Change Detection**: Content hashing prevents unnecessary API calls
- **Batch Processing**: Admin migration endpoint processes notes sequentially

### Embedding Cache

Embeddings are cached in the database with content hash:
- Only regenerate when note content changes
- Automatic cleanup on note deletion
- No redundant API calls for unchanged notes

### Search Performance

- **pgvector Index**: IVFFlat index provides sub-linear search time
- **Threshold Filtering**: 0.65 threshold reduces irrelevant results
- **Authorization Filter**: Filters applied after similarity search
- **Hybrid Approach**: Fallback to keyword search if semantic search fails

## Error Handling

The implementation includes robust error handling:

1. **OpenAI API Failures**: Logged but don't break note operations
2. **Empty Text**: Returns zero vector instead of failing
3. **Database Errors**: Transaction rollback prevents data corruption
4. **Search Failures**: Automatic fallback to keyword-only search

## Limitations

1. **Language Support**: Optimized for English text
2. **Content Length**: Very long notes may be truncated by OpenAI API
3. **Real-time Updates**: Slight delay between note update and embedding generation
4. **Cost**: Requires OpenAI API key and incurs usage costs
5. **Vector DB**: Requires separate PostgreSQL database with pgvector

## Future Enhancements

Potential improvements:

1. **Async Processing**: Queue-based embedding generation for better performance
2. **Batch API Calls**: Use OpenAI batch API for cost reduction
3. **Embedding Models**: Support for other embedding providers (Cohere, local models)
4. **Semantic Caching**: Cache common query embeddings
5. **Multi-language**: Language detection and model selection
6. **Reranking**: Use cross-encoder models for result reranking
7. **Metadata Filtering**: Combine semantic search with tag/date filters

## Troubleshooting

### pgvector Connection Issues

```bash
# Check if container is running
docker ps | grep pgvector

# Check logs
docker logs notesapp-pgvector

# Restart container
docker-compose -f docker-compose.pgvector.yml restart
```

### OpenAI API Errors

- Verify API key is set correctly
- Check API quota and billing
- Review logs for specific error messages

### Missing Embeddings

Run the migration endpoint to generate embeddings for existing notes:

```bash
curl -X POST http://localhost:8080/api/admin/embeddings/migrate \
  -H "Authorization: Bearer <admin-jwt-token>"
```

## References

- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Hibernate Community Dialects](https://github.com/vladmihalcea/hypersistence-utils)
