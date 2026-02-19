#!/bin/bash

# Quick check if Nextcloud is conflicting with BizTrackKos
# Run this on your VPS

echo "Checking for Nextcloud and BizTrackKos conflicts..."
echo ""

# Check if both are running
echo "1. Running containers:"
docker ps --format "table {{.Names}}\t{{.Image}}" | grep -E "NAME|bizkos|nextcloud"
echo ""

# Check for nextcloud env
echo "2. Nextcloud database configuration (if running):"
NC_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i nextcloud | head -1)
if [ -n "$NC_CONTAINER" ]; then
    echo "Found Nextcloud container: $NC_CONTAINER"
    docker exec $NC_CONTAINER env | grep -E "POSTGRES_DB|POSTGRES_USER|DATABASE_URL" | sed 's/PASSWORD=.*/PASSWORD=**HIDDEN**/'
else
    echo "No Nextcloud container found"
fi
echo ""

# Check bizkos env
echo "3. BizTrackKos database configuration:"
BK_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i bizkos | grep -v db | head -1)
if [ -n "$BK_CONTAINER" ]; then
    echo "Found BizTrackKos container: $BK_CONTAINER"
    docker exec $BK_CONTAINER env | grep -E "POSTGRES_DB|POSTGRES_USER|DATABASE_URL" | sed 's/PASSWORD=.*/PASSWORD=**HIDDEN**/'
else
    echo "BizTrackKos container not running!"
fi
echo ""

# Check if sharing database
echo "4. Checking if both apps use same PostgreSQL..."
if [ -n "$NC_CONTAINER" ] && [ -n "$BK_CONTAINER" ]; then
    NC_DB=$(docker exec $NC_CONTAINER env | grep POSTGRES_DB | cut -d= -f2)
    BK_DB=$(docker exec $BK_CONTAINER env | grep POSTGRES_DB | cut -d= -f2)
    NC_USER=$(docker exec $NC_CONTAINER env | grep POSTGRES_USER | cut -d= -f2)
    BK_USER=$(docker exec $BK_CONTAINER env | grep POSTGRES_USER | cut -d= -f2)

    echo "Nextcloud DB: $NC_DB (user: $NC_USER)"
    echo "BizTrackKos DB: $BK_DB (user: $BK_USER)"

    if [ "$NC_DB" = "$BK_DB" ] || [ "$NC_USER" = "$BK_USER" ]; then
        echo "⚠️  WARNING: Database conflict detected!"
        echo "Both apps may be trying to use the same database."
    else
        echo "✓ Databases appear to be separate"
    fi
fi
echo ""

# Check shared networks
echo "5. Docker networks:"
echo "Nextcloud networks:"
if [ -n "$NC_CONTAINER" ]; then
    docker inspect $NC_CONTAINER --format '{{range $net, $conf := .NetworkSettings.Networks}}{{$net}} {{end}}'
fi
echo ""
echo "BizTrackKos networks:"
if [ -n "$BK_CONTAINER" ]; then
    docker inspect $BK_CONTAINER --format '{{range $net, $conf := .NetworkSettings.Networks}}{{$net}} {{end}}'
fi
echo ""

echo "==================================="
echo "Recommendation:"
echo "==================================="
echo ""
echo "Make sure your .env file has:"
echo "  POSTGRES_DB=kosmanage"
echo "  POSTGRES_USER=hibhaqqi"
echo "  DATABASE_URL=postgres://hibhaqqi:rahasia@db:5432/kosmanage"
echo ""
echo "NOT nextcloud's credentials!"
echo ""
