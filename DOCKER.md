# Docker Deployment Guide

This guide explains how to run the Chat Application using Docker and Docker Compose.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose (included with Docker Desktop)
- OpenRouter API Key from https://openrouter.ai/keys

## Quick Start

### 1. Set Up Environment Variables

Create a `.env` file in the project root (if not already exists):

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your OpenRouter API key:

```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
```

### 2. Build and Run with Docker Compose

```bash
# Build and start both services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs

### 4. Stop the Services

```bash
# Stop services (keeps containers)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (deletes database)
docker-compose down -v
```

## Docker Architecture

### Backend Service
- **Image**: Python 3.10 slim
- **Port**: 8001
- **Database**: SQLite (persisted in `./backend/data/`)
- **Health Check**: Pings `/health` endpoint every 30s

### Frontend Service
- **Image**: Multi-stage build (Node.js → Nginx)
- **Port**: 5173
- **Web Server**: Nginx Alpine
- **Health Check**: Pings root URL every 30s

### Networking
- Both services run on the same Docker network (`chat-network`)
- Frontend can access backend via `http://backend:8001`
- Ports are forwarded to host for external access

## Development vs Production

### Development Mode

The current `docker-compose.yml` includes volume mounts for live code updates:

```yaml
volumes:
  - ./backend:/app  # Backend code hot-reload
```

To enable hot-reloading, modify the backend CMD in `backend/Dockerfile`:

```dockerfile
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
```

### Production Mode

For production deployment:

1. **Remove volume mounts** from `docker-compose.yml`:
   ```yaml
   volumes:
     - ./backend/data:/app/data  # Keep only data persistence
   ```

2. **Use environment-specific .env files**:
   ```bash
   docker-compose --env-file .env.production up -d
   ```

3. **Consider using PostgreSQL** instead of SQLite:
   ```yaml
   services:
     db:
       image: postgres:15-alpine
       environment:
         POSTGRES_DB: chatapp
         POSTGRES_USER: chatuser
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       volumes:
         - postgres-data:/var/lib/postgresql/data
     
     backend:
       environment:
         DATABASE_URL: postgresql://chatuser:${DB_PASSWORD}@db:5432/chatapp
   
   volumes:
     postgres-data:
   ```

4. **Add reverse proxy** (Nginx/Traefik) for SSL and load balancing

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Rebuild After Changes

```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild and restart
docker-compose up -d --build backend
```

### Execute Commands in Containers

```bash
# Backend shell
docker-compose exec backend bash

# Run database migrations
docker-compose exec backend alembic upgrade head

# Frontend shell
docker-compose exec frontend sh
```

### Check Service Health

```bash
# View service status
docker-compose ps

# Check backend health
curl http://localhost:8001/health

# Check frontend health
curl http://localhost:5173
```

## Environment Variables Reference

### Required Variables (in `.env`)
- `OPENROUTER_API_KEY`: Your OpenRouter API key

### Optional Variables (set in `docker-compose.yml`)
- `OPENROUTER_BASE_URL`: OpenRouter API endpoint (default: https://openrouter.ai/api/v1)
- `PORT`: Backend port (default: 8001)
- `APP_TITLE`: Application title for API docs
- `APP_URL`: Application URL for OpenRouter headers
- `DATABASE_URL`: Database connection string

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Missing API key - Check .env file
# 2. Port conflict - Change port in docker-compose.yml
# 3. Database error - Remove data volume: docker-compose down -v
```

### Frontend can't connect to backend
```bash
# Verify backend is running
docker-compose ps backend

# Check backend health
curl http://localhost:8001/health

# Ensure CORS is configured (already set in main.py)
```

### Database persistence issues
```bash
# Check data directory
ls -la backend/data/

# Recreate database
docker-compose down -v
docker-compose up -d
```

### Port already in use
```bash
# Windows - Find process using port 8001
netstat -ano | findstr :8001

# Linux/Mac - Find process using port 8001
lsof -i :8001

# Change port in docker-compose.yml
ports:
  - "8002:8001"  # Map to different host port
```

## Performance Optimization

### Reduce Build Time

Use `.dockerignore` files (already created):
- Excludes `node_modules`, `__pycache__`, `.git`, etc.
- Speeds up Docker build context

### Layer Caching

Dependencies are installed before code copy:
```dockerfile
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .  # Code changes don't invalidate dependency cache
```

### Multi-Stage Builds

Frontend uses multi-stage build to reduce image size:
- Build stage: ~500MB (Node.js)
- Final stage: ~50MB (Nginx)

## Security Best Practices

1. **Never commit `.env` files** with real API keys
2. **Use `.env.example`** as template
3. **Rotate API keys** regularly
4. **Use secrets management** for production (Docker Secrets, HashiCorp Vault)
5. **Run containers as non-root** (add to Dockerfile):
   ```dockerfile
   RUN adduser -D appuser
   USER appuser
   ```

## Next Steps

- Add database migrations with Alembic
- Set up CI/CD pipeline (GitHub Actions)
- Deploy to cloud (AWS ECS, Google Cloud Run, Azure Container Instances)
- Add monitoring (Prometheus + Grafana)
- Implement logging aggregation (ELK Stack)

## Useful Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Docker Guide](https://fastapi.tiangolo.com/deployment/docker/)
- [Vite Docker Guide](https://vitejs.dev/guide/static-deploy.html)
