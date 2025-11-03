# NotesApp Deployment Guide

This guide explains how to configure and deploy the NotesApp for both development and production environments.

## Table of Contents
- [Environment Configuration](#environment-configuration)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Environment Variables Reference](#environment-variables-reference)

---

## Environment Configuration

The application uses environment-based configuration to seamlessly switch between development and production:

### Frontend (React + Vite)
- Uses `.env.development` for local development
- Uses `.env.production` for production builds
- Environment variables must be prefixed with `VITE_`

### Backend (Spring Boot)
- Uses Spring Profiles: `dev` and `prod`
- Profile-specific properties in `application-dev.properties` and `application-prod.properties`
- Activated via `spring.profiles.active` or `SPRING_PROFILES_ACTIVE` environment variable

---

## Development Setup

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.6+
- MySQL 8.0+

### 1. Frontend Development Setup

```bash
cd frontend

# Create .env.development (or copy from .env.example)
cat > .env.development << EOF
VITE_API_URL=http://localhost:8080
EOF

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 2. Backend Development Setup

```bash
cd notes

# Set environment variables
export DATABASE_PASSWORD=your_dev_password
export JWT_SECRET=your_dev_jwt_secret
export GOOGLE_CLIENT_ID=your_google_client_id
export GOOGLE_CLIENT_SECRET=your_google_client_secret

# Or create a .env file and load it
# export $(cat .env | xargs)

# Run with dev profile (default)
./mvnw spring-boot:run
```

The backend will run on `http://localhost:8080`

**Development Configuration** (application-dev.properties):
- Database: `localhost:3306/notes_schema`
- CORS: Allows `http://localhost:5173`
- Cookie Security: `secure=false`, `sameSite=Lax` (suitable for HTTP)
- JPA: `ddl-auto=update`, `show-sql=true`

---

## Production Deployment

### 1. Frontend Production Build

```bash
cd frontend

# Create .env.production with your production API URL
cat > .env.production << EOF
VITE_API_URL=https://api.yourdomain.com
EOF

# Build for production
npm run build

# The build output will be in the 'dist' folder
# Deploy the 'dist' folder to your hosting service (Vercel, Netlify, S3, etc.)
```

**Example: Deploy to Netlify/Vercel**
```bash
# Netlify
netlify deploy --prod --dir=dist

# Vercel
vercel --prod
```

Make sure to set the environment variable `VITE_API_URL` in your hosting platform's dashboard.

### 2. Backend Production Deployment

```bash
cd notes

# Set production environment variables
export SPRING_PROFILES_ACTIVE=prod
export DATABASE_URL=jdbc:mysql://your-prod-db-host:3306/notes_db
export DATABASE_USERNAME=prod_user
export DATABASE_PASSWORD=your_secure_password
export JWT_SECRET=your_secure_jwt_secret_min_256_bits
export GOOGLE_CLIENT_ID=your_google_client_id
export GOOGLE_CLIENT_SECRET=your_google_client_secret
export FRONTEND_URL=https://yourdomain.com

# Build the application
./mvnw clean package -DskipTests

# Run the JAR file
java -jar target/notes-*.jar
```

**Production Configuration** (application-prod.properties):
- Database: From `DATABASE_URL` environment variable
- CORS: Allows origin from `FRONTEND_URL` environment variable
- Cookie Security: `secure=true`, `sameSite=None` (required for HTTPS)
- JPA: `ddl-auto=validate`, `show-sql=false`

### Production Deployment Options

#### Option 1: Docker Deployment

Create a `Dockerfile` in the backend directory:

```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/notes-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build and run:
```bash
docker build -t notesapp-backend .
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DATABASE_URL=jdbc:mysql://host:3306/notes_db \
  -e DATABASE_USERNAME=user \
  -e DATABASE_PASSWORD=pass \
  -e JWT_SECRET=secret \
  -e FRONTEND_URL=https://yourdomain.com \
  notesapp-backend
```

#### Option 2: Cloud Platform (AWS, GCP, Azure)

Deploy the JAR file to:
- **AWS Elastic Beanstalk**: Upload JAR and configure environment variables
- **Google Cloud Run**: Deploy container with environment variables
- **Azure App Service**: Deploy JAR and configure application settings

#### Option 3: Traditional Server

```bash
# On your production server
scp target/notes-*.jar user@server:/opt/notesapp/

# SSH into server and create systemd service
sudo nano /etc/systemd/system/notesapp.service
```

systemd service file:
```ini
[Unit]
Description=NotesApp Backend Service
After=mysql.service

[Service]
User=notesapp
WorkingDirectory=/opt/notesapp
ExecStart=/usr/bin/java -jar /opt/notesapp/notes-*.jar
Environment="SPRING_PROFILES_ACTIVE=prod"
Environment="DATABASE_URL=jdbc:mysql://localhost:3306/notes_db"
Environment="DATABASE_USERNAME=notesapp_user"
Environment="DATABASE_PASSWORD=secure_password"
Environment="JWT_SECRET=your_jwt_secret"
Environment="FRONTEND_URL=https://yourdomain.com"
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable notesapp
sudo systemctl start notesapp
```

---

## Environment Variables Reference

### Frontend Environment Variables

| Variable | Description | Development | Production |
|----------|-------------|-------------|------------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8080` | `https://api.yourdomain.com` |

### Backend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | Yes | `dev` or `prod` |
| `DATABASE_URL` | MySQL connection URL | Yes | `jdbc:mysql://localhost:3306/notes_schema` |
| `DATABASE_USERNAME` | Database username | Yes | `notes_user` |
| `DATABASE_PASSWORD` | Database password | Yes | `secure_password` |
| `JWT_SECRET` | Secret key for JWT signing (min 256 bits) | Yes | `your_base64_encoded_secret` |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | Yes (for OAuth) | `123456.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret | Yes (for OAuth) | `GOCSPX-abc123` |
| `FRONTEND_URL` | Frontend application URL (for CORS & OAuth redirect) | No (has defaults) | `https://yourdomain.com` |

### Profile-Specific Properties

Properties set automatically based on active profile:

**Development (dev)**:
- `app.frontend.url`: `http://localhost:5173`
- `app.cookie.secure`: `false`
- `app.cookie.same-site`: `Lax`
- `spring.jpa.hibernate.ddl-auto`: `update`
- `spring.jpa.show-sql`: `true`

**Production (prod)**:
- `app.frontend.url`: From `FRONTEND_URL` env var (default: `https://your-production-frontend.com`)
- `app.cookie.secure`: `true`
- `app.cookie.same-site`: `None`
- `spring.jpa.hibernate.ddl-auto`: `validate`
- `spring.jpa.show-sql`: `false`

---

## Security Checklist for Production

- [ ] Set `SPRING_PROFILES_ACTIVE=prod`
- [ ] Use strong `JWT_SECRET` (minimum 256 bits)
- [ ] Use secure database credentials
- [ ] Set `FRONTEND_URL` to your actual frontend domain
- [ ] Enable HTTPS on both frontend and backend
- [ ] Configure Google OAuth2 authorized redirect URIs in Google Console
- [ ] Review and update CORS origins in production
- [ ] Set up database backups
- [ ] Configure proper logging and monitoring
- [ ] Use environment variables (never commit secrets to git)

---

## Troubleshooting

### CORS Issues
- Verify `FRONTEND_URL` matches your actual frontend URL
- Check browser console for CORS errors
- In production, ensure both frontend and backend use HTTPS

### Cookie Issues
- In production, cookies require `secure=true` and HTTPS
- Check `sameSite` setting matches your deployment setup
- Ensure `FRONTEND_URL` and backend domain are configured correctly for OAuth redirects

### Database Connection Issues
- Verify `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD`
- Check database server is accessible from application server
- Verify database exists and schema is up to date

### OAuth Login Not Working
- Verify Google OAuth credentials are correct
- Add authorized redirect URIs in Google Cloud Console:
  - Dev: `http://localhost:8080/login/oauth2/code/google`
  - Prod: `https://api.yourdomain.com/login/oauth2/code/google`
- Check `FRONTEND_URL` is set correctly for post-auth redirect

---

## Quick Start Commands

### Development
```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend (in another terminal)
cd notes
export DATABASE_PASSWORD=yourpass
export JWT_SECRET=yoursecret
./mvnw spring-boot:run
```

### Production Build
```bash
# Frontend
cd frontend
npm run build  # Output in dist/

# Backend
cd notes
./mvnw clean package -DskipTests  # Output in target/
```

---

## Additional Resources

- [Vite Environment Variables Guide](https://vitejs.dev/guide/env-and-mode.html)
- [Spring Boot Profiles Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.profiles)
- [Spring Security OAuth2 Documentation](https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html)
