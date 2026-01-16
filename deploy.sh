#!/bin/bash

# BizTrackKos - Quick Deployment Script

set -e

echo "🚀 BizTrackKos Deployment Script"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if docker-compose exists
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose not found${NC}"
    echo "Please install docker-compose first"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env from example..."

    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env created. Please edit it with your values.${NC}"
        echo ""
        read -p "Press Enter after editing .env file..."
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        echo "Please create .env file manually"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Environment check passed${NC}"
echo ""

# Option menu
echo "Choose deployment option:"
echo "1) Fresh deployment (stop, remove volumes, rebuild)"
echo "2) Quick restart (no rebuild)"
echo "3) Rebuild only (no data loss)"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}🔄 Fresh deployment...${NC}"
        echo "This will DELETE ALL DATA. Are you sure?"
        read -p "Type 'yes' to confirm: " confirm

        if [ "$confirm" = "yes" ]; then
            echo ""
            echo "Stopping containers..."
            docker-compose down -v

            echo "Removing old images..."
            docker system prune -f

            echo "Building new images..."
            docker-compose build --no-cache

            echo "Starting services..."
            docker-compose up -d

            echo ""
            echo -e "${GREEN}✅ Deployment complete!${NC}"
            echo "Waiting for services to start..."
            sleep 10

            echo ""
            echo "Checking logs..."
            docker-compose logs --tail=50 app
        else
            echo "Deployment cancelled."
        fi
        ;;

    2)
        echo ""
        echo -e "${YELLOW}🔄 Quick restart...${NC}"
        docker-compose restart

        echo ""
        echo -e "${GREEN}✅ Restart complete!${NC}"
        docker-compose logs --tail=20 app
        ;;

    3)
        echo ""
        echo -e "${YELLOW}🔄 Rebuilding...${NC}"
        docker-compose up -d --build

        echo ""
        echo -e "${GREEN}✅ Rebuild complete!${NC}"
        docker-compose logs --tail=50 app
        ;;

    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "=================================="
echo "Deployment Summary"
echo "=================================="
echo ""

# Show status
echo "Container Status:"
docker-compose ps

echo ""
echo "🌐 Application URL: http://localhost:9002"
echo ""
echo "Useful Commands:"
echo "  View logs:    docker-compose logs -f app"
echo "Stop all:      docker-compose down"
echo "Database:      docker-compose exec db psql -U postgres -d biztrackkos"
echo ""
echo -e "${GREEN}✅ Done!${NC}"
