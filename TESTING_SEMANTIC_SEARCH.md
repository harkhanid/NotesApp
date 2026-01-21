# Semantic Search Testing Guide

This guide provides step-by-step instructions to test the semantic search feature from setup to validation.

---

## Phase 1: Prerequisites & Setup

### Step 1: Check Docker is Running

```bash
# Check if Docker is running
docker --version
docker ps

# If Docker is not running, start Docker Desktop
# On macOS: Open Docker Desktop application
# On Linux: sudo systemctl start docker
```

**Expected output:**
```
Docker version 24.x.x, build xxxxx
CONTAINER ID   IMAGE   ...
```

### Step 2: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. **IMPORTANT:** Copy the key immediately (shown only once)
6. Save it securely - you'll need it for the next step

**Your API key will look like:** `sk-proj-xxxxxxxxxxxxxxxxxxxxx`

### Step 3: Start pgvector Database

```bash
# Navigate to project root
cd /Users/dharmikharkhani/Documents/Projects2024/NotesApp

# Start the pgvector container
docker-compose -f docker-compose.pgvector.yml up -d

# Wait a few seconds for the database to initialize
sleep 5
```

### Step 4: Verify pgvector is Running

```bash
# Check container is running
docker ps | grep pgvector

# Check logs for successful startup
docker logs notesapp-pgvector

# Test connection
docker exec -it notesapp-pgvector psql -U pgvector_user -d notesapp_vectors -c "SELECT version();"
```

**Expected output:**
```
CONTAINER ID   IMAGE                    STATUS
abc123def456   pgvector/pgvector:pg17   Up 30 seconds

# In logs, you should see:
database system is ready to accept connections
```

### Step 5: Set Environment Variables

```bash
# Export OpenAI API key
export OPENAI_API_KEY="sk-proj-your-actual-key-here"

# Verify it's set
echo $OPENAI_API_KEY

# These are already set as defaults, but you can override if needed:
# export PGVECTOR_DATABASE_URL="jdbc:postgresql://localhost:5433/notesapp_vectors"
# export PGVECTOR_DATABASE_USERNAME="pgvector_user"
# export PGVECTOR_DATABASE_PASSWORD="pgvector_dev_password"
```

**IMPORTANT:** Replace `sk-proj-your-actual-key-here` with your actual OpenAI API key!

---

## Phase 2: Application Startup

### Step 6: Stop Any Running Instances

```bash
# Check for running Spring Boot instances
lsof -i :8080

# If something is running on port 8080, kill it:
# Get the PID from the lsof output (second column)
# kill -9 <PID>

# Or kill all Java processes (use with caution):
# pkill -9 java
```

### Step 7: Start Spring Boot Application

```bash
# Navigate to the notes backend directory
cd /Users/dharmikharkhani/Documents/Projects2024/NotesApp/notes

# Start with all required environment variables
DATABASE_PASSWORD=demo_dev \
JWT_SECRET=my-super-secret-jwt-key-for-development-only-min-256-bits \
GOOGLE_CLIENT_ID=placeholder \
GOOGLE_CLIENT_SECRET=placeholder \
OPENAI_API_KEY=$OPENAI_API_KEY \
./mvnw spring-boot:run
```

### Step 8: Verify Startup Logs

Watch the console output for:

**✅ Success indicators:**
```
Started NotesApplication in X.XXX seconds
HikariPool-1 - Start completed (MySQL connection)
HikariPool-2 - Start completed (pgvector connection)
```

**❌ Error indicators to watch for:**
```
Failed to configure a DataSource
OpenAI API key is not set
Could not connect to PostgreSQL
```

### Step 9: Test Basic Connectivity

Open a new terminal window:

```bash
# Test if application is responding
curl http://localhost:8080/actuator/health

# Expected response:
# {"status":"UP"}
```

---

## Phase 3: Authentication & User Setup

### Step 10: Login as Existing User

**Option A: Using existing frontend**

1. Open browser: `http://localhost:5173`
2. Login with your credentials
3. Open browser DevTools (F12) → Application → Cookies
4. Copy the JWT token value

**Option B: Using API directly**

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }' \
  -c cookies.txt \
  -v

# The JWT token will be in the Set-Cookie header
# Save it for later use
```

**For easier testing, save the token:**

```bash
# Extract token from cookie file (macOS/Linux)
JWT_TOKEN=$(grep jwt cookies.txt | awk '{print $7}')
echo "JWT Token: $JWT_TOKEN"

# Or manually set it:
# JWT_TOKEN="your-jwt-token-here"
```

### Step 11: Verify User Has Notes

```bash
# Get all notes for the user
curl http://localhost:8080/api/notes \
  -H "Cookie: jwt=$JWT_TOKEN" \
  -H "Content-Type: application/json" | jq

# This should return an array of notes
```

**Expected response:**
```json
[
  {
    "id": "note-uuid-1",
    "title": "My First Note",
    "content": "<p>Some content</p>",
    "tags": ["welcome"],
    ...
  },
  ...
]
```

### Step 12: Identify a Test Note ID

```bash
# Save a note ID for testing
NOTE_ID="paste-a-note-uuid-here"

# Or extract automatically from the first note:
NOTE_ID=$(curl -s http://localhost:8080/api/notes \
  -H "Cookie: jwt=$JWT_TOKEN" | jq -r '.[0].id')

echo "Testing with note ID: $NOTE_ID"
```

---

## Phase 4: Testing Embedding Endpoints

### Step 13: Check Embedding Status

```bash
# Check if the note has an embedding
curl http://localhost:8080/api/notes/$NOTE_ID/embeddings/status \
  -H "Cookie: jwt=$JWT_TOKEN" | jq

# Expected response:
{
  "success": true,
  "noteId": "abc-123-...",
  "hasEmbedding": false,  # or true if already exists
  "message": "Note does not have an embedding"
}
```

### Step 14: Regenerate Single Embedding

```bash
# Generate/regenerate embedding for the note
curl -X POST http://localhost:8080/api/notes/$NOTE_ID/embeddings/regenerate \
  -H "Cookie: jwt=$JWT_TOKEN" | jq

# This will call OpenAI API and save the embedding
# Takes 1-2 seconds
```

**Expected response:**
```json
{
  "success": true,
  "message": "Embedding regenerated successfully",
  "noteId": "abc-123-..."
}
```

**Watch the application logs** - you should see:
```
Generating embedding for text of length: 157
Successfully generated embedding of dimension: 1536
Created embedding for note: abc-123-...
```

### Step 15: Verify Embedding Created

```bash
# Check status again - should now show hasEmbedding: true
curl http://localhost:8080/api/notes/$NOTE_ID/embeddings/status \
  -H "Cookie: jwt=$JWT_TOKEN" | jq

# Expected:
{
  "success": true,
  "noteId": "abc-123-...",
  "hasEmbedding": true,
  "message": "Note has an embedding"
}
```

### Step 16: Test Bulk Regeneration

```bash
# Regenerate embeddings for ALL your notes
curl -X POST http://localhost:8080/api/notes/embeddings/regenerate-all \
  -H "Cookie: jwt=$JWT_TOKEN" | jq

# This may take a while if you have many notes
# OpenAI API rate limit: ~3000 requests/minute for free tier
```

**Expected response:**
```json
{
  "success": true,
  "message": "Embedding regeneration completed",
  "totalNotes": 5,
  "processedNotes": 5,
  "successCount": 5,
  "failureCount": 0
}
```

---

## Phase 5: Testing Search

### Step 17: Test Keyword Search

```bash
# Traditional keyword search (no embeddings used)
curl "http://localhost:8080/api/notes/search?keyword=machine&mode=keyword" \
  -H "Cookie: jwt=$JWT_TOKEN" | jq

# Returns notes containing the word "machine"
```

### Step 18: Test Hybrid Search

```bash
# Hybrid search (combines keyword + semantic)
curl "http://localhost:8080/api/notes/search?keyword=artificial%20intelligence" \
  -H "Cookie: jwt=$JWT_TOKEN" | jq

# This should return:
# - Notes with "artificial intelligence" (keyword match)
# - Notes about AI, ML, neural networks (semantic similarity)
# - Results ranked by combined score
```

### Step 19: Compare Search Results

**Test semantic understanding:**

```bash
# Search for "ML basics"
curl "http://localhost:8080/api/notes/search?keyword=ML%20basics" \
  -H "Cookie: jwt=$JWT_TOKEN" | jq -r '.[].title'

# Should return notes about:
# - "Machine Learning Fundamentals"
# - "Introduction to Neural Networks"
# - "Getting Started with AI"
# Even if they don't contain "ML" or "basics" exactly!
```

**Test concept matching:**

```bash
# Search for "how do computers learn"
curl "http://localhost:8080/api/notes/search?keyword=how%20do%20computers%20learn" \
  -H "Cookie: jwt=$JWT_TOKEN" | jq -r '.[].title'

# Should find notes about machine learning, AI, training models
```

### Step 20: Test Edge Cases

```bash
# Empty query
curl "http://localhost:8080/api/notes/search?keyword=" \
  -H "Cookie: jwt=$JWT_TOKEN"

# Special characters
curl "http://localhost:8080/api/notes/search?keyword=%23hashtag%20%40mention" \
  -H "Cookie: jwt=$JWT_TOKEN"

# Very long query (test OpenAI token limits)
curl "http://localhost:8080/api/notes/search?keyword=$(python3 -c 'print("test " * 1000)')" \
  -H "Cookie: jwt=$JWT_TOKEN"
```

---

## Phase 6: Admin Endpoints (Optional)

**Note:** These require ROLE_ADMIN. Skip if you're not an admin user.

### Step 21: Test Migration Endpoint

```bash
# Generate embeddings for ALL notes in the system
curl -X POST http://localhost:8080/api/admin/embeddings/migrate \
  -H "Cookie: jwt=$JWT_TOKEN" | jq
```

**Expected response:**
```json
{
  "status": "completed",
  "totalNotes": 150,
  "successCount": 148,
  "failureCount": 2
}
```

### Step 22: Check Statistics

```bash
# Get embedding statistics
curl http://localhost:8080/api/admin/embeddings/stats \
  -H "Cookie: jwt=$JWT_TOKEN" | jq
```

---

## Phase 7: Verification & Database Inspection

### Step 23: Check pgvector Database

```bash
# Connect to PostgreSQL
docker exec -it notesapp-pgvector psql -U pgvector_user -d notesapp_vectors

# Inside psql, run these queries:
```

**SQL Commands:**

```sql
-- Check if pgvector extension is loaded
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Count embeddings
SELECT COUNT(*) FROM note_embeddings;

-- View sample embedding
SELECT
    id,
    note_id,
    content_hash,
    created_at,
    updated_at,
    array_length(embedding::float[], 1) as dimension
FROM note_embeddings
LIMIT 5;

-- Check embedding dimension
SELECT note_id, array_length(embedding::float[], 1) as dimensions
FROM note_embeddings
LIMIT 1;

-- Find similar notes (test cosine similarity)
-- Replace the vector with an actual embedding from your DB
SELECT
    note_id,
    1 - (embedding <=> (SELECT embedding FROM note_embeddings LIMIT 1)) as similarity
FROM note_embeddings
ORDER BY similarity DESC
LIMIT 5;

-- Exit psql
\q
```

### Step 24: Test Error Handling

```bash
# Test with invalid note ID
curl http://localhost:8080/api/notes/invalid-uuid/embeddings/status \
  -H "Cookie: jwt=$JWT_TOKEN"

# Test unauthorized access (without JWT)
curl http://localhost:8080/api/notes/$NOTE_ID/embeddings/regenerate \
  -X POST

# Test with note owned by another user
# (You'll need another note ID that you don't own)
```

### Step 25: Monitor Logs

In the Spring Boot console, check for:

```
✅ Good log messages:
- "Generating embedding for text of length: X"
- "Successfully generated embedding of dimension: 1536"
- "Created embedding for note: ..."
- "Semantic search found X results"

❌ Error messages to watch for:
- "OpenAI API error: 401" → Check your API key
- "OpenAI API error: 429" → Rate limit exceeded
- "Could not connect to pgvector" → Check Docker container
- "Failed to generate embedding" → Check OpenAI API key/quota
```

---

## Troubleshooting Guide

### Issue: "OpenAI API error: 401 Unauthorized"

**Solution:**
```bash
# Check if API key is set
echo $OPENAI_API_KEY

# Verify the key is valid at OpenAI platform
# Regenerate if necessary and update environment variable
```

### Issue: "Could not connect to PostgreSQL"

**Solution:**
```bash
# Check if container is running
docker ps | grep pgvector

# Check container logs
docker logs notesapp-pgvector

# Restart container
docker-compose -f docker-compose.pgvector.yml restart

# Verify connection manually
docker exec -it notesapp-pgvector psql -U pgvector_user -d notesapp_vectors -c "SELECT 1;"
```

### Issue: "Rate limit exceeded (429)"

**Solution:**
- OpenAI free tier: 3 requests/minute, 200 requests/day
- Wait a minute between bulk operations
- Consider upgrading OpenAI plan for production use

### Issue: "Embedding dimension mismatch"

**Solution:**
```bash
# Check application.properties has:
# openai.embedding.dimensions=1536

# Verify in database:
docker exec -it notesapp-pgvector psql -U pgvector_user -d notesapp_vectors \
  -c "SELECT array_length(embedding::float[], 1) FROM note_embeddings LIMIT 1;"

# Should return: 1536
```

### Issue: "Search returns no results"

**Solution:**
1. Verify embeddings exist: Check step 23
2. Check similarity threshold (0.65) - might be too high
3. Try lowering threshold in `HybridSearchService.java`
4. Verify notes have content (not empty)

---

## Quick Test Script

Save this as `test-semantic-search.sh`:

```bash
#!/bin/bash

echo "=== Semantic Search Test Script ==="

# Configuration
export OPENAI_API_KEY="YOUR_API_KEY_HERE"
BASE_URL="http://localhost:8080"

# Get JWT token (replace with your credentials)
echo "1. Logging in..."
curl -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt -s > /dev/null

JWT_TOKEN=$(grep jwt cookies.txt | awk '{print $7}')

# Get first note ID
echo "2. Getting notes..."
NOTE_ID=$(curl -s $BASE_URL/api/notes -H "Cookie: jwt=$JWT_TOKEN" | jq -r '.[0].id')
echo "   Testing with note: $NOTE_ID"

# Check embedding status
echo "3. Checking embedding status..."
curl -s $BASE_URL/api/notes/$NOTE_ID/embeddings/status \
  -H "Cookie: jwt=$JWT_TOKEN" | jq

# Generate embedding
echo "4. Generating embedding..."
curl -s -X POST $BASE_URL/api/notes/$NOTE_ID/embeddings/regenerate \
  -H "Cookie: jwt=$JWT_TOKEN" | jq

# Test search
echo "5. Testing search..."
curl -s "$BASE_URL/api/notes/search?keyword=test" \
  -H "Cookie: jwt=$JWT_TOKEN" | jq -r '.[].title'

echo "=== Test Complete ==="
rm cookies.txt
```

Make it executable and run:
```bash
chmod +x test-semantic-search.sh
./test-semantic-search.sh
```

---

## Success Criteria

Your semantic search is working correctly if:

- ✅ pgvector container is running
- ✅ Spring Boot connects to both MySQL and PostgreSQL
- ✅ Embeddings are created when notes are created/updated
- ✅ `/embeddings/status` shows `hasEmbedding: true`
- ✅ Search returns semantically similar results
- ✅ Hybrid search combines keyword + semantic results
- ✅ No errors in application logs
- ✅ Database contains embeddings with dimension 1536

---

## Next Steps After Testing

1. **Monitor OpenAI costs** - Check your usage at platform.openai.com
2. **Tune similarity threshold** - Adjust in `HybridSearchService` if needed
3. **Test with real data** - Create notes on various topics and search
4. **Benchmark performance** - Time search queries with different note counts
5. **Plan production deployment** - Follow SEMANTIC_SEARCH.md deployment guide

Happy testing! 🚀
