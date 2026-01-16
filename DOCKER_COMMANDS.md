# 🐳 Docker Quick Reference

## Essential Commands

### Build & Start
```bash
docker-compose up -d --build    # Build and start
docker-compose up -d             # Start only
docker-compose down              # Stop all
docker-compose restart           # Restart all
```

### Logs
```bash
docker-compose logs              # All logs
docker-compose logs -f app       # Follow app logs
docker-compose logs --tail=50    # Last 50 lines
```

### Management
```bash
docker-compose ps                # Status
docker-compose exec app sh       # Shell access
docker-compose exec db psql      # Database access
```

### Cleanup
```bash
docker-compose down -v           # Stop + remove volumes
docker system prune -a           # Remove unused resources
docker image prune -a            # Remove old images
```

## Troubleshooting

```bash
# Full reset
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Check what's using port 9002
lsof -i :9002

# Force remove container
docker rm -f bizkos

# Database health check
docker-compose exec db pg_isready -U postgres
```

## Quick Test

```bash
# 1. Start
docker-compose up -d

# 2. Wait 10 seconds

# 3. Check logs
docker-compose logs app

# 4. Test
curl http://localhost:9002
```

---

*For detailed deployment guide, see DOCKER_DEPLOYMENT.md*
