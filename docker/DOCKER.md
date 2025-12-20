# Wrapp0r Docker Deployment

Deploy Wrapp0r using Docker containers.

## Quick Start

```bash
# From the project root
cd docker

# Copy environment config
cp .env.example .env

# Build images
docker compose build

# Start containers
docker compose up -d
```

Access the app at **http://localhost**

## Containers

| Container | Image | Port | Description |
|-----------|-------|------|-------------|
| wrapp0r-web | wrapp0r/web:latest | 80 | Nginx serving React frontend |
| wrapp0r-server | wrapp0r/server:latest | 3001 | Node.js API + video rendering |

The web container proxies `/api/*` requests to the server.

## Configuration

### Environment Variables

Edit `.env` or pass variables inline:

```bash
# Use custom ports
WEB_PORT=8080 SERVER_PORT=3002 docker compose up -d

# Set CORS for production
CORS_ORIGIN=https://your-domain.com docker compose up -d
```

Available variables:

| Variable | Default | Description |
|----------|---------|-------------|
| WEB_PORT | 80 | Frontend port |
| SERVER_PORT | 3001 | API port |
| CORS_ORIGIN | * | Allowed CORS origins |

## Commands

```bash
# Build images
docker compose build

# Build without cache (fresh build)
docker compose build --no-cache

# Start containers
docker compose up -d

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f server

# Check container status
docker compose ps

# Stop containers
docker compose down

# Stop and remove volumes
docker compose down -v
```

## Health Checks

Both containers have health checks:

```bash
# Check container health
docker compose ps

# Manual health checks
curl http://localhost/health          # Web
curl http://localhost:3001/api/health # Server
```

## Production Deployment

For production, use the production compose file:

```bash
docker compose -f docker-compose.prod.yml up -d
```

Production features:
- Resource limits (CPU/memory)
- Log rotation
- Automatic restart
- HTTPS port exposure (443)

### Resource Requirements

| Service | Memory | Notes |
|---------|--------|-------|
| web | 256MB | Static file serving |
| server | 2-4GB | Video rendering needs memory |

### SSL/HTTPS

1. Obtain SSL certificates
2. Mount in web container
3. Update `nginx.conf` with SSL config

## Troubleshooting

### Port already in use

```bash
# Use different ports
SERVER_PORT=3002 docker compose up -d
```

### Video rendering fails

- Ensure server has at least 2GB RAM
- Check Chromium: `docker exec wrapp0r-server chromium --version`

### Container keeps restarting

```bash
# Check logs
docker compose logs server
docker compose logs web
```

### Rebuild after code changes

```bash
docker compose build --no-cache
docker compose up -d
```

## File Structure

```
docker/
├── DOCKER.md              # This file
├── .env.example           # Environment template
├── docker-compose.yml     # Development config
├── docker-compose.prod.yml# Production config
├── Dockerfile.web         # Frontend image
├── Dockerfile.server      # API server image
└── nginx.conf             # Nginx configuration
```
