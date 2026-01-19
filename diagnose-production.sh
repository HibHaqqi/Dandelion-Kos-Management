#!/bin/bash

# BizTrackKos Production Diagnostic Script
# Run this on your VPS to diagnose the upload issue

echo "========================================"
echo "BizTrackKos Production Diagnostics"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "1. Checking running containers..."
echo "-----------------------------------"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "2. Checking bizkos container environment..."
echo "-------------------------------------------"
if docker ps | grep -q bizkos; then
    echo "DATABASE_URL:"
    docker exec bizkos env | grep DATABASE_URL || echo "  ${RED}DATABASE_URL not found!${NC}"
    echo ""
    echo "Other database env vars:"
    docker exec bizkos env | grep -E "POSTGRES|DB_" || echo "  No other DB vars found"
else
    echo "${RED}bizkos container is not running!${NC}"
fi
echo ""

echo "3. Checking uploads directory permissions..."
echo "--------------------------------------------"
if [ -d "public/uploads" ]; then
    echo "Local uploads directory:"
    ls -lh public/uploads/ | head -5
    echo ""
    echo "Permissions:"
    ls -ld public/uploads/
else
    echo "${YELLOW}public/uploads directory not found locally${NC}"
fi
echo ""

echo "4. Checking container uploads directory..."
echo "------------------------------------------"
if docker ps | grep -q bizkos; then
    echo "Container uploads directory:"
    docker exec bizkos ls -lh /app/public/uploads/ 2>/dev/null || echo "  ${RED}Cannot access uploads in container${NC}"
    echo ""
    echo "Directory ownership:"
    docker exec bizkos stat -c "%U:%G %a" /app/public/uploads/ 2>/dev/null || echo "  ${RED}Cannot stat directory${NC}"
fi
echo ""

echo "5. Checking for Nextcloud containers..."
echo "---------------------------------------"
if docker ps | grep -i nextcloud; then
    echo "${YELLOW}Nextcloud containers found:${NC}"
    docker ps | grep -i nextcloud
    echo ""
    echo "Nextcloud environment:"
    NEXTCLOUD_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i nextcloud | head -1)
    if [ -n "$NEXTCLOUD_CONTAINER" ]; then
        docker exec $NEXTCLOUD_CONTAINER env | grep -E "POSTGRES|DB_" | head -5
    fi
else
    echo "${GREEN}No Nextcloud containers running${NC}"
fi
echo ""

echo "6. Checking Docker networks..."
echo "------------------------------"
docker network ls
echo ""
echo "Connected containers to networks:"
docker network inspect $(docker network ls -q --filter driver=bridge) --format '{{range .Containers}}{{.Name}}{{end}}' 2>/dev/null
echo ""

echo "7. Checking PostgreSQL connections..."
echo "------------------------------------"
if docker ps | grep -q bizkos-db; then
    echo "Current PostgreSQL connections:"
    docker exec bizkos-db psql -U hibhaqqi -d kosmanage -c "SELECT usename, application_name, client_addr FROM pg_stat_activity WHERE datname='kosmanage';" 2>/dev/null || echo "  ${RED}Could not query connections${NC}"
else
    echo "${YELLOW}bizkos-db container not found (may be named differently)${NC}"
    echo "Looking for other PostgreSQL containers..."
    docker ps --format "{{.Names}}" | grep -i postgres
fi
echo ""

echo "8. Recent application logs (upload related)..."
echo "----------------------------------------------"
if docker ps | grep -q bizkos; then
    echo "Last 50 lines of app logs:"
    docker logs --tail=50 bizkos 2>&1 | grep -i -E "upload|file|error|nextcloud|database" || echo "  No relevant logs found"
fi
echo ""

echo "9. Checking disk space..."
echo "-------------------------"
df -h | grep -E "Filesystem|/$|/var"
echo ""

echo "========================================"
echo "Diagnosis Complete!"
echo "========================================"
echo ""
echo "What to check:"
echo "1. Is DATABASE_URL pointing to 'nextcloud' user?"
echo "2. Are there multiple PostgreSQL databases/containers?"
echo "3. Does the uploads directory have write permissions?"
echo "4. Are bizkos and nextcloud on the same Docker network?"
echo ""
