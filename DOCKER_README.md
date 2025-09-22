# Scout Docker Setup (Simplified)

This document provides instructions for running the Scout application using Docker containers with a simplified approach.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+

## Quick Start

### Option 1: Automated Setup (Recommended)

**Windows PowerShell:**
```powershell
.\scripts\docker-setup.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh
```

### Option 2: Manual Setup

1. **Build and start services:**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

2. **Run database migrations:**
   ```bash
   docker-compose run --rm backend python manage.py migrate
   ```

3. **Create superuser:**
   ```bash
   docker-compose run --rm backend python manage.py createsuperuser
   ```

## Services

| Service | Description |
|---------|-------------|
| Frontend | React application (Vite dev server) |
| Backend | Django API server (runserver) |
| Database | PostgreSQL database |
| Redis | Redis cache/session store |

## Architecture

This simplified setup uses:
- **Frontend**: Vite dev server with hot reloading
- **Backend**: Django development server
- **No reverse proxy**: Direct access to services
- **Volume mounting**: Live code changes without rebuilds

## Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Access Containers
```bash
# Backend container
docker-compose exec backend bash

# Database container
docker-compose exec db psql -U postgres -d scout_db
```

### Database Operations
```bash
# Run migrations
docker-compose run --rm backend python manage.py migrate

# Create superuser
docker-compose run --rm backend python manage.py createsuperuser

# Django shell
docker-compose run --rm backend python manage.py shell
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Clean Up
```bash
# Stop and remove containers
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v
```

## Environment Variables

**Important**: Create a `.env` file in the project root for secure configuration. Never commit secrets to version control!

**All environment variables are required** - the docker-compose.yml will fail if any are missing.

1. **Copy the example file:**
   ```bash
   cp env.example .env
   ```

2. **Edit the `.env` file with your values:**
   ```env
   # Database Configuration
   POSTGRES_DB=scout_db
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_secure_password_here
   POSTGRES_HOST=db
   POSTGRES_PORT=5433

   # Django Configuration
   SECRET_KEY=your_secret_key_here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1

   # Redis Configuration
   REDIS_URL=redis://redis:6379/0
   ```

3. **Security Notes:**
   - **All variables are required** - no default values for security
   - Use strong passwords for `POSTGRES_PASSWORD`
   - Generate a secure `SECRET_KEY` for production
   - Set `DEBUG=False` for production
   - Add your domain to `ALLOWED_HOSTS` for production

## Development Workflow

1. **Start services:**
   ```bash
   docker-compose up -d
   ```

2. **Make code changes** - they'll be reflected immediately due to volume mounting

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop services:**
   ```bash
   docker-compose down
   ```

## Troubleshooting

### Database Connection Issues
```bash
# Check if database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Test database connection
docker-compose exec backend python manage.py dbshell
```

### Frontend Build Issues
```bash
# Rebuild frontend
docker-compose build --no-cache frontend

# Check frontend logs
docker-compose logs frontend
```

### Permission Issues
```bash
# Fix file permissions
docker-compose exec backend chown -R appuser:appuser /app
```

## Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:8000/admin/
curl http://localhost:3000/
```

## Backup and Restore

### Database Backup
```bash
docker-compose exec db pg_dump -U postgres scout_db > backup.sql
```

### Database Restore
```bash
docker-compose exec -T db psql -U postgres scout_db < backup.sql
```

## Monitoring

### Resource Usage
```bash
docker stats
```

### Container Status
```bash
docker-compose ps
```

## Notes

- This setup is optimized for **development** with hot reloading
- For production, consider using a reverse proxy like nginx
- All services run with volume mounting for live code changes
- Database and Redis data persist between container restarts