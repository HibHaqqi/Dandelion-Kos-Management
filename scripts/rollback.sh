#!/bin/bash

# Rollback script for failed deployments
# This script helps you rollback to a previous working state

set -e

echo "=== Deployment Rollback Script ==="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if we're in the project directory
if [ ! -f "package.json" ]; then
    print_error "Not in project root directory!"
    echo "Please run this script from the project root."
    exit 1
fi

# Show current status
echo "Current Git Status:"
git log --oneline -5
echo ""

echo "Docker Containers:"
docker compose ps
echo ""

# Ask user what they want to rollback
echo "Rollback Options:"
echo "1. Rollback to previous Git commit (keeps database)"
echo "2. Rollback database schema only"
echo "3. Full rollback (code + database to last working state)"
echo "4. Exit"
echo ""
read -p "Choose rollback option (1-4): " choice

case $choice in
    1)
        echo "=== Rolling back to previous Git commit ==="
        print_info "Getting last commit hash..."
        LAST_COMMIT=$(git log --oneline -2 | tail -1 | awk '{print $1}')

        print_info "Rolling back to commit: $LAST_COMMIT"
        git reset --hard $LAST_COMMIT
        print_success "Code rolled back"

        print_info "Rebuilding Docker containers..."
        docker compose down
        docker compose build --no-cache
        docker compose up -d
        print_success "Containers rebuilt and restarted"

        print_warning "Note: Database was NOT modified. Data is intact."
        ;;
    2)
        echo "=== Rolling back database schema ==="
        print_warning "This will rollback database schema changes!"
        read -p "Are you sure? (yes/no): " confirm

        if [ "$confirm" = "yes" ]; then
            print_info "Available migrations:"
            ls -lht prisma/migrations/ | head -10

            echo ""
            read -p "Enter migration folder name to rollback to (or press Enter to skip): " migration_name

            if [ -n "$migration_name" ]; then
                print_info "Rolling back to migration: $migration_name"
                npx prisma migrate resolve --rolled-back "$migration_name"
                print_success "Database rolled back"
            else
                print_info "Skipping database rollback"
            fi
        else
            print_info "Database rollback cancelled"
        fi
        ;;
    3)
        echo "=== Full Rollback ==="
        print_warning "This will rollback BOTH code and database!"
        read -p "Are you sure? (yes/no): " confirm

        if [ "$confirm" = "yes" ]; then
            # Get last 5 commits
            echo "Recent commits:"
            git log --oneline -5
            echo ""

            read -p "Enter commit hash to rollback to: " commit_hash

            if [ -n "$commit_hash" ]; then
                print_info "Rolling back code to: $commit_hash"
                git reset --hard $commit_hash

                print_info "Rebuilding containers..."
                docker compose down
                docker compose build --no-cache
                docker compose up -d

                print_info "Waiting for containers to start..."
                sleep 10

                print_info "Applying database schema..."
                ./scripts/migrate.sh

                print_success "Full rollback completed!"
            else
                print_error "No commit hash provided"
                exit 1
            fi
        else
            print_info "Full rollback cancelled"
        fi
        ;;
    4)
        print_info "Exiting rollback script"
        exit 0
        ;;
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

echo ""
print_success "Rollback completed!"
echo ""
echo "Current status:"
docker compose ps
echo ""
echo "If something is still wrong, you can:"
echo "  - Check logs: docker compose logs -f app"
echo "  - Restart: docker compose restart"
echo "  - Stop all: docker compose down"
