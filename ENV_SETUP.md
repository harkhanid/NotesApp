# Environment Setup Quick Guide

## First Time Setup

### Frontend
```bash
cd frontend
cp .env.example .env.development
# Edit .env.development if needed (default is localhost:8080)
npm install
npm run dev
```

### Backend
```bash
cd notes
cp .env.example .env
# Edit .env with your database credentials and secrets
export $(cat .env | xargs)
./mvnw spring-boot:run
```

## Configuration Files

### Frontend Environment Files
- `.env.development` - Used during `npm run dev`
- `.env.production` - Used during `npm run build`
- `.env.example` - Template for environment variables

### Backend Property Files
- `application.properties` - Base configuration
- `application-dev.properties` - Development profile (default)
- `application-prod.properties` - Production profile

## Switching Environments

### Development (Default)
```bash
# Frontend
npm run dev

# Backend (dev profile is default)
./mvnw spring-boot:run
```

### Production
```bash
# Frontend
npm run build  # Uses .env.production

# Backend
export SPRING_PROFILES_ACTIVE=prod
export FRONTEND_URL=https://yourdomain.com
# ... other production env vars
./mvnw spring-boot:run
```

## Key Environment Variables

### Frontend
- `VITE_API_URL` - Backend API endpoint

### Backend
- `SPRING_PROFILES_ACTIVE` - Profile to use (dev/prod)
- `DATABASE_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `FRONTEND_URL` - Frontend URL (for CORS and OAuth)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.
