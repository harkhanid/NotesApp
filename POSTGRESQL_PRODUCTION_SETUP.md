# PostgreSQL Production Setup with Supabase

This guide covers setting up Supabase (PostgreSQL with pgvector) for NotesApp's production deployment.

## Quick Setup

### 1. Create Supabase Project

1. Sign up at [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and set:
   - **Project Name**: `notesapp-prod` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
4. Wait ~2 minutes for project provisioning

### 2. Enable pgvector Extension

1. Go to **SQL Editor** in Supabase dashboard
2. Run this command:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Click "Run" - you should see "Success. No rows returned"

### 3. Initialize Database Schema

The Spring Boot application will automatically create tables on first run, but you need to manually add the vector column:

1. In **SQL Editor**, run:
   ```sql
   -- Add vector column to notes table (run AFTER first Spring Boot startup)
   ALTER TABLE notes ADD COLUMN IF NOT EXISTS embedding vector(1536);

   -- Create index for faster vector similarity search
   CREATE INDEX IF NOT EXISTS notes_embedding_idx ON notes
   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
   ```

### 4. Get Connection Details

1. Go to **Settings** > **Database**
2. Note these values:

   - **Host**: `db.[PROJECT-REF].supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: (the one you set earlier)

### 5. Configure Spring Boot Application

Set these environment variables for your backend:

```bash
# Database Connection
DATABASE_URL=jdbc:postgresql://db.[PROJECT-REF].supabase.co:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-database-password

# OpenAI for Embeddings
OPENAI_API_KEY=your-openai-api-key

# JWT & OAuth (required)
JWT_SECRET=your-jwt-secret-min-256-bits
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 6. Test Connection

Run your Spring Boot application:

```bash
cd notes
DATABASE_URL=jdbc:postgresql://db.[PROJECT-REF].supabase.co:5432/postgres \
DATABASE_USERNAME=postgres \
DATABASE_PASSWORD=your-password \
OPENAI_API_KEY=your-key \
JWT_SECRET=your-secret \
GOOGLE_CLIENT_ID=placeholder \
GOOGLE_CLIENT_SECRET=placeholder \
./mvnw spring-boot:run
```

Look for successful connection logs:
```
HikariPool-1 - Starting...
HikariPool-1 - Start completed.
```

## Supabase Free Tier Limits

- **Database Size**: 500 MB
- **Bandwidth**: 5 GB/month
- **Concurrent Connections**: Up to 60
- **Automatic Backups**: Daily (kept for 7 days)

**Estimated Capacity**: ~80,000 notes with embeddings (assuming 6KB per note with vector data)

## Monitoring

### Check Database Size

In Supabase **SQL Editor**:

```sql
-- Total database size
SELECT pg_size_pretty(pg_database_size('postgres')) as size;

-- Notes table size
SELECT pg_size_pretty(pg_total_relation_size('notes')) as size;

-- Count notes with embeddings
SELECT COUNT(*) FROM notes WHERE embedding IS NOT NULL;
```

### View Active Connections

```sql
SELECT count(*) FROM pg_stat_activity WHERE datname = 'postgres';
```

## Backups

Supabase provides automatic daily backups (free tier: 7 days retention).

**Manual Backup** (optional):
1. Go to **Database** > **Backups** in Supabase dashboard
2. Click "Download backup" for point-in-time recovery

## Security Best Practices

1. **Never commit credentials** - Use environment variables
2. **Rotate database password** periodically via Supabase Settings
3. **Enable Row Level Security (RLS)** if using Supabase client directly (not needed for Spring Boot backend)
4. **Use connection pooling** - Spring Boot's HikariCP handles this automatically
5. **Monitor usage** - Check Supabase dashboard for usage metrics

## Production Deployment Checklist

- [ ] Supabase project created in appropriate region
- [ ] pgvector extension enabled
- [ ] Database schema initialized (Spring Boot auto-creates tables)
- [ ] Vector column added to notes table
- [ ] Vector index created
- [ ] Environment variables configured on hosting platform
- [ ] Database connection tested
- [ ] Backups verified in Supabase dashboard
- [ ] Connection pooling configured (default HikariCP settings are good)

## Troubleshooting

### "relation 'notes' does not exist"
- **Cause**: Spring Boot hasn't created tables yet
- **Fix**: Start Spring Boot application once, let it create tables, then add vector column

### "type 'vector' does not exist"
- **Cause**: pgvector extension not enabled
- **Fix**: Run `CREATE EXTENSION IF NOT EXISTS vector;`

### "Too many connections"
- **Cause**: Exceeded connection limit
- **Fix**: Check `spring.datasource.hikari.maximum-pool-size` (default: 10, free tier supports up to 60)

### "Could not connect to database"
- **Cause**: Incorrect connection string or firewall
- **Fix**: Verify connection details, Supabase allows connections from anywhere by default

## Upgrading to Paid Tier

When you outgrow free tier (>500MB or >5GB bandwidth/month):

**Pro Plan** ($25/month):
- 8 GB database size
- 250 GB bandwidth
- 7-day point-in-time recovery
- Daily backups kept for 14 days

## Alternative: Neon.tech

If you prefer serverless PostgreSQL:
- Free tier: 0.5 GB storage, autoscaling
- Built-in pgvector support
- Similar setup process to Supabase
- Visit [neon.tech](https://neon.tech)

---

## Next Steps

1. Complete Supabase setup above
2. Deploy Spring Boot backend to hosting platform (Render, Railway, Fly.io, etc.)
3. Set environment variables on hosting platform
4. Test semantic search feature in production
5. Monitor database size and connection usage

For deployment platforms and frontend hosting, see deployment documentation.
