# PostgreSQL Production Setup Guide

This guide covers setting up PostgreSQL with pgvector extension for production deployment of NotesApp's semantic search feature.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Option 1: Managed Database (Recommended)](#option-1-managed-database-recommended)
3. [Option 2: Self-Hosted on VPS](#option-2-self-hosted-on-vps)
4. [Option 3: Docker Compose (Production)](#option-3-docker-compose-production)
5. [Database Initialization](#database-initialization)
6. [Environment Configuration](#environment-configuration)
7. [Security Best Practices](#security-best-practices)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

- PostgreSQL 12 or higher (pgvector requires 12+, recommended 15+)
- OpenAI API key (for embeddings generation)
- Sufficient storage for vector data (~6KB per note for 1536-dimensional embeddings)

---

## Option 1: Managed Database (Recommended)

Managed databases provide automatic backups, scaling, monitoring, and pgvector support.

### A. Supabase (Free tier available)

**Pros**: Free tier, built-in pgvector support, automatic backups, simple setup

**Steps**:

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Note down connection details from Settings > Database
4. Enable pgvector extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
5. Run initialization script (see [Database Initialization](#database-initialization))

**Connection String Format**:
```
jdbc:postgresql://db.[PROJECT-REF].supabase.co:5432/postgres?user=postgres&password=[PASSWORD]
```

### B. Neon (Serverless PostgreSQL)

**Pros**: Serverless, pay-per-use, free tier, pgvector support

**Steps**:

1. Sign up at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string from dashboard
4. Connect and enable pgvector:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
5. Run initialization script

**Connection String Format**:
```
jdbc:postgresql://[ENDPOINT].neon.tech/[DATABASE]?user=[USER]&password=[PASSWORD]&sslmode=require
```

### C. AWS RDS PostgreSQL

**Pros**: Enterprise-grade, highly available, automatic backups

**Steps**:

1. Create RDS PostgreSQL instance (v15+ recommended)
2. Enable pgvector:
   - Connect to RDS instance
   - Run: `CREATE EXTENSION vector;`
3. Configure security group to allow inbound connections
4. Note endpoint, database name, username, password
5. Run initialization script

**Connection String Format**:
```
jdbc:postgresql://[ENDPOINT].[REGION].rds.amazonaws.com:5432/[DATABASE]
```

### D. Render (Managed PostgreSQL)

**Pros**: Simple, integrated with Render deployments, free tier available

**Steps**:

1. Create PostgreSQL instance at [render.com](https://render.com)
2. Enable pgvector extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Copy internal/external connection strings
4. Run initialization script

---

## Option 2: Self-Hosted on VPS

For VPS deployment (DigitalOcean, Linode, Hetzner, etc.)

### Installation Steps (Ubuntu 22.04/24.04)

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install PostgreSQL 15
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install postgresql-15 postgresql-contrib-15 -y

# 3. Install pgvector
sudo apt install postgresql-15-pgvector -y

# 4. Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 5. Create database and user
sudo -u postgres psql <<EOF
CREATE DATABASE notesapp_vectors;
CREATE USER pgvector_user WITH ENCRYPTED PASSWORD 'YOUR_SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE notesapp_vectors TO pgvector_user;
\c notesapp_vectors
GRANT ALL ON SCHEMA public TO pgvector_user;
CREATE EXTENSION IF NOT EXISTS vector;
EOF

# 6. Configure PostgreSQL for remote connections (if needed)
sudo nano /etc/postgresql/15/main/postgresql.conf
# Set: listen_addresses = '*'

sudo nano /etc/postgresql/15/main/pg_hba.conf
# Add: host    all             all             0.0.0.0/0               scram-sha-256

# 7. Restart PostgreSQL
sudo systemctl restart postgresql

# 8. Configure firewall
sudo ufw allow 5432/tcp
```

### Security Hardening

```bash
# 1. Use strong password
# Generate secure password
openssl rand -base64 32

# 2. Restrict access by IP (recommended)
# In pg_hba.conf, replace 0.0.0.0/0 with your application server IP:
# host    all             all             YOUR_APP_IP/32          scram-sha-256

# 3. Enable SSL/TLS
sudo -u postgres psql <<EOF
ALTER SYSTEM SET ssl = on;
EOF
sudo systemctl restart postgresql
```

---

## Option 3: Docker Compose (Production)

For production Docker deployments with persistence and backups.

### Production docker-compose.yml

```yaml
version: '3.8'

services:
  pgvector:
    image: pgvector/pgvector:pg17
    container_name: notesapp-pgvector-prod
    environment:
      POSTGRES_DB: notesapp_vectors
      POSTGRES_USER: ${PGVECTOR_USER}
      POSTGRES_PASSWORD: ${PGVECTOR_PASSWORD}
      # Performance tuning
      POSTGRES_INITDB_ARGS: "-E UTF8 --locale=en_US.UTF-8"
    ports:
      - "${PGVECTOR_PORT:-5432}:5432"
    volumes:
      # Persistent data
      - pgvector_data:/var/lib/postgresql/data
      # Initialization script
      - ./init-pgvector.sql:/docker-entrypoint-initdb.d/init.sql
      # Backups directory
      - ./backups:/backups
      # PostgreSQL configuration
      - ./postgresql.conf:/etc/postgresql/postgresql.conf
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${PGVECTOR_USER} -d notesapp_vectors"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s
    restart: unless-stopped
    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
    # Logging
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  pgvector_data:
    driver: local

networks:
  default:
    name: notesapp_network
```

### Production PostgreSQL Configuration

Create `postgresql.conf`:

```conf
# Connection settings
max_connections = 100
shared_buffers = 512MB
effective_cache_size = 1536MB
maintenance_work_mem = 128MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 5242kB
min_wal_size = 1GB
max_wal_size = 4GB

# Logging
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_timezone = 'UTC'

# Performance for pgvector
shared_preload_libraries = 'vector'
max_parallel_workers_per_gather = 2
max_parallel_workers = 4
```

### Environment Variables (.env)

```bash
# PostgreSQL Configuration
PGVECTOR_USER=pgvector_user
PGVECTOR_PASSWORD=YOUR_SECURE_PASSWORD_HERE
PGVECTOR_PORT=5432
PGVECTOR_DATABASE=notesapp_vectors
```

---

## Database Initialization

### SQL Initialization Script

Save as `init-pgvector.sql`:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create note_embeddings table
CREATE TABLE IF NOT EXISTS note_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL UNIQUE,
    embedding vector(1536),
    content_hash VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
-- IVFFlat index for approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS note_embeddings_vector_idx
ON note_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for note_id lookups
CREATE INDEX IF NOT EXISTS note_embeddings_note_id_idx
ON note_embeddings(note_id);

-- Index for updated_at (for cleanup queries)
CREATE INDEX IF NOT EXISTS note_embeddings_updated_at_idx
ON note_embeddings(updated_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_note_embeddings_updated_at
BEFORE UPDATE ON note_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust user name if different)
GRANT ALL PRIVILEGES ON TABLE note_embeddings TO pgvector_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO pgvector_user;
```

### Manual Initialization

If not using docker-compose init script:

```bash
# Connect to database
psql -h [HOST] -U [USER] -d notesapp_vectors

# Run initialization
\i init-pgvector.sql

# Verify installation
SELECT * FROM pg_extension WHERE extname = 'vector';
\d note_embeddings
```

---

## Environment Configuration

### Spring Boot Configuration

Update `application.properties` or `application-prod.properties`:

```properties
# PGVector Database Configuration
pgvector.datasource.url=${PGVECTOR_DATABASE_URL}
pgvector.datasource.username=${PGVECTOR_DATABASE_USERNAME}
pgvector.datasource.password=${PGVECTOR_DATABASE_PASSWORD}
pgvector.datasource.driver-class-name=org.postgresql.Driver

# Connection pool settings (HikariCP)
pgvector.datasource.hikari.maximum-pool-size=10
pgvector.datasource.hikari.minimum-idle=2
pgvector.datasource.hikari.connection-timeout=30000
pgvector.datasource.hikari.idle-timeout=600000
pgvector.datasource.hikari.max-lifetime=1800000

# OpenAI Configuration
openai.api.key=${OPENAI_API_KEY}
openai.api.url=https://api.openai.com/v1
openai.embedding.model=text-embedding-3-small
openai.embedding.dimensions=1536
```

### Environment Variables for Production

```bash
# PostgreSQL Vector Database
export PGVECTOR_DATABASE_URL="jdbc:postgresql://[HOST]:[PORT]/notesapp_vectors"
export PGVECTOR_DATABASE_USERNAME="pgvector_user"
export PGVECTOR_DATABASE_PASSWORD="your_secure_password"

# OpenAI API
export OPENAI_API_KEY="sk-your-openai-api-key"

# SSL/TLS (if required)
export PGVECTOR_DATABASE_URL="jdbc:postgresql://[HOST]:[PORT]/notesapp_vectors?sslmode=require"
```

---

## Security Best Practices

### 1. Use Strong Passwords

```bash
# Generate secure password
openssl rand -base64 32
```

### 2. Enable SSL/TLS Connections

For managed databases, SSL is usually enabled by default. For self-hosted:

```sql
-- Verify SSL is enabled
SHOW ssl;

-- Require SSL for specific user
ALTER USER pgvector_user SET ssl = on;
```

Connection string with SSL:
```
jdbc:postgresql://host:port/database?sslmode=require
```

### 3. Network Security

- **Managed databases**: Use IP whitelisting
- **Self-hosted**: Configure firewall rules
- **Docker**: Use internal networks

```bash
# Allow only application server IP
sudo ufw allow from YOUR_APP_SERVER_IP to any port 5432
```

### 4. Regular Updates

```bash
# Update PostgreSQL and pgvector
sudo apt update
sudo apt upgrade postgresql-15 postgresql-15-pgvector
```

### 5. Backup Encryption

Encrypt backups before storing:

```bash
# Backup with encryption
pg_dump -h localhost -U pgvector_user notesapp_vectors | \
  openssl enc -aes-256-cbc -salt -out backup.sql.enc
```

---

## Monitoring & Maintenance

### Database Monitoring

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('notesapp_vectors'));

-- Check table size
SELECT pg_size_pretty(pg_total_relation_size('note_embeddings'));

-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'note_embeddings';

-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'notesapp_vectors';

-- Check slow queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - pg_stat_activity.query_start > interval '1 minute';
```

### Backup Strategy

#### Automated Daily Backups (Cron)

```bash
#!/bin/bash
# save as /usr/local/bin/backup-pgvector.sh

BACKUP_DIR="/backups/pgvector"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/notesapp_vectors_$TIMESTAMP.sql.gz"

# Create backup
pg_dump -h localhost -U pgvector_user notesapp_vectors | gzip > $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# Log completion
echo "$(date): Backup completed - $BACKUP_FILE" >> /var/log/pgvector-backup.log
```

Add to crontab:
```bash
# Run daily at 2 AM
0 2 * * * /usr/local/bin/backup-pgvector.sh
```

#### Docker Backup Script

```bash
#!/bin/bash
# Backup from Docker container

docker exec notesapp-pgvector-prod pg_dump \
  -U pgvector_user notesapp_vectors | \
  gzip > ./backups/backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restore from Backup

```bash
# Restore from compressed backup
gunzip -c backup_20240129_020000.sql.gz | \
  psql -h localhost -U pgvector_user notesapp_vectors

# Or for Docker
docker exec -i notesapp-pgvector-prod psql \
  -U pgvector_user notesapp_vectors < backup.sql
```

### Index Maintenance

```sql
-- Rebuild index (improves search performance)
REINDEX INDEX note_embeddings_vector_idx;

-- Analyze table (update statistics)
ANALYZE note_embeddings;

-- Vacuum (reclaim storage)
VACUUM ANALYZE note_embeddings;
```

### Performance Tuning

```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT note_id, 1 - (embedding <=> '[0.1,0.2,...]') AS similarity
FROM note_embeddings
ORDER BY embedding <=> '[0.1,0.2,...]'
LIMIT 10;

-- Tune IVFFlat index lists parameter
-- More lists = faster queries but slower index build
-- Recommended: sqrt(total_rows) to 4*sqrt(total_rows)
DROP INDEX note_embeddings_vector_idx;
CREATE INDEX note_embeddings_vector_idx
ON note_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 200);  -- Adjust based on data size
```

---

## Migration Checklist

- [ ] Choose hosting option (managed/self-hosted/Docker)
- [ ] Install PostgreSQL 12+ with pgvector extension
- [ ] Create database and user
- [ ] Run initialization script
- [ ] Configure firewall/network security
- [ ] Set up SSL/TLS if required
- [ ] Update application environment variables
- [ ] Test database connectivity from application
- [ ] Migrate embeddings using `/api/admin/embeddings/migrate`
- [ ] Set up automated backups
- [ ] Configure monitoring and alerts
- [ ] Document connection details securely

---

## Troubleshooting

### Connection Issues

```bash
# Test connectivity
psql -h [HOST] -U [USER] -d notesapp_vectors

# Check if port is open
telnet [HOST] [PORT]

# Check firewall rules
sudo ufw status
```

### pgvector Extension Not Found

```sql
-- Check available extensions
SELECT * FROM pg_available_extensions WHERE name = 'vector';

-- Check installed extensions
\dx

-- Install if missing (requires superuser)
CREATE EXTENSION vector;
```

### Performance Issues

```sql
-- Check if index is being used
EXPLAIN SELECT * FROM note_embeddings
ORDER BY embedding <=> '[0.1,0.2,...]' LIMIT 10;

-- Rebuild index
REINDEX INDEX CONCURRENTLY note_embeddings_vector_idx;

-- Update statistics
ANALYZE note_embeddings;
```

---

## Cost Estimation

### Managed Database Costs (Approximate)

- **Supabase**: Free tier available, Pro from $25/month
- **Neon**: Free tier (0.5GB storage), Scale from $19/month
- **AWS RDS**: db.t3.micro ~$15/month + storage ($0.115/GB/month)
- **Render**: Free tier available, Standard from $7/month

### Storage Requirements

- Base table: ~300 bytes per row
- Vector embedding: ~6KB per row (1536 dimensions × 4 bytes)
- Indexes: ~2x vector size
- **Total**: ~18KB per note

**Example**:
- 10,000 notes = ~180MB
- 100,000 notes = ~1.8GB
- 1,000,000 notes = ~18GB

### OpenAI API Costs

- Model: `text-embedding-3-small`
- Cost: $0.02 per 1M tokens
- Average note: ~500 tokens
- **Example**: 10,000 notes = ~$0.10

---

## Support Resources

- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- NotesApp Issues: Create an issue in your repository

---

**Last Updated**: January 2026
