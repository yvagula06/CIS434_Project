# Docker Setup Summary

This document summarizes the Docker configuration for the Chat Application.

## Created Files

### 1. Backend Dockerfile (`backend/Dockerfile`)
- **Base Image**: Python 3.10 slim
- **Working Directory**: `/app`
- **Exposed Port**: 8001
- **Key Features**:
  - Installs system dependencies (gcc)
  - Copies and installs Python requirements first (better caching)
  - Creates data directory for SQLite database
  - Runs with uvicorn on 0.0.0.0:8001

### 2. Frontend Dockerfile (`frontend/Dockerfile`)
- **Multi-Stage Build**:
  - **Stage 1 (Builder)**: Node.js 18 Alpine
    - Installs dependencies with `npm ci`
    - Builds production assets with `npm run build`
  - **Stage 2 (Production)**: Nginx Alpine
    - Copies built assets from builder stage
    - Serves static files on port 5173
    - Includes custom nginx configuration
- **Final Image Size**: ~50MB (vs ~500MB with Node.js)

### 3. Nginx Configuration (`frontend/nginx.conf`)
- Listens on port 5173
- SPA routing fallback (serves index.html for all routes)
- Gzip compression enabled
- Static asset caching (1 year for JS/CSS/images)
- No caching for index.html

### 4. Docker Compose (`docker-compose.yml`)
- **Services**:
  - **backend**: FastAPI server on port 8001
    - Environment variables from `.env` file
    - Volume mount for SQLite persistence (`./backend/data`)
    - Health check on `/health` endpoint
  - **frontend**: Nginx server on port 5173
    - Depends on backend service
    - Health check on root URL
- **Networking**: Custom network `chat-network`
- **Restart Policy**: `unless-stopped`

### 5. Docker Ignore Files
- **Backend** (`.dockerignore`):
  - `__pycache__`, `*.pyc`, `*.pyo`, `*.pyd`
  - `.env`, `venv/`, `*.db`
  - `.git`, `README.md`
- **Frontend** (`.dockerignore`):
  - `node_modules`, `dist`
  - `.env*` files
  - `*.log` files

### 6. Documentation (`DOCKER.md`)
Comprehensive Docker deployment guide with:
- Prerequisites and quick start
- Architecture explanation
- Development vs production configurations
- Common commands and troubleshooting
- Security best practices

## Usage

### Quick Start

```bash
# 1. Set up .env file
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# 2. Build and start services
docker-compose up -d --build

# 3. Access application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8001
# API Docs: http://localhost:8001/docs
```

### Common Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build

# Remove volumes (deletes database)
docker-compose down -v
```

## Environment Variables

The Docker setup reads from the `.env` file in the project root:

```env
# Required
OPENROUTER_API_KEY=your_api_key_here

# Optional (set in docker-compose.yml)
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
PORT=8001
APP_TITLE=Open Chat API
APP_URL=http://localhost:8001
DATABASE_URL=sqlite:///./data/chat_app.db
```

## Architecture

```
┌─────────────────┐
│  User Browser   │
└────────┬────────┘
         │ http://localhost:5173
         ▼
┌─────────────────┐
│    Frontend     │  (Nginx on port 5173)
│  (chat-frontend)│  Serves React SPA
└────────┬────────┘
         │ API calls to http://localhost:8001
         ▼
┌─────────────────┐
│     Backend     │  (FastAPI on port 8001)
│  (chat-backend) │  Handles API requests
└────────┬────────┘
         │
         ├─► OpenRouter API (external)
         │
         └─► SQLite Database (./backend/data/)
```

## Health Checks

Both services include health checks for monitoring:

- **Backend**: GET `/health` every 30s
  - Returns: `{"status": "healthy", "timestamp": "..."}`
  
- **Frontend**: GET `/` every 30s
  - Returns: React app index page

## Data Persistence

SQLite database is persisted using volume mounts:

```yaml
volumes:
  - ./backend/data:/app/data
```

This ensures conversations and messages survive container restarts.

## Production Considerations

For production deployment:

1. **Remove development volume mounts** (keep only data persistence)
2. **Use PostgreSQL** instead of SQLite for better concurrency
3. **Add reverse proxy** (Nginx/Traefik) for SSL termination
4. **Use Docker secrets** for API keys instead of .env files
5. **Enable logging** to external service (CloudWatch, ELK)
6. **Set resource limits** in docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

## Troubleshooting

### Port Conflicts
If ports 5173 or 8001 are already in use:
```yaml
# In docker-compose.yml, change host port
ports:
  - "5174:5173"  # Frontend
  - "8002:8001"  # Backend
```

### Database Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d
```

### Backend Health Check Fails
```bash
# Check logs
docker-compose logs backend

# Verify API key in .env
cat .env | grep OPENROUTER_API_KEY
```

## Next Steps

- Deploy to cloud platform (AWS ECS, Google Cloud Run, Azure)
- Set up CI/CD pipeline with GitHub Actions
- Add database migrations with Alembic
- Implement monitoring and alerting
- Configure SSL/TLS certificates

## Resources

- Complete deployment guide: [DOCKER.md](./DOCKER.md)
- Backend setup: [backend/QUICKSTART.md](./backend/QUICKSTART.md)
- Frontend docs: [frontend/README.md](./frontend/README.md)
