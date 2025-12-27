#!/bin/bash

# Production Deployment Script
# This script applies database migrations and rebuilds the application

set -e  # Exit on any error

echo "🚀 Starting deployment..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install

echo ""
echo "🗄️  Step 2: Applying database migrations..."
npx prisma db push

echo ""
echo "✅ Verifying migration..."
# Check if checkoutDate column exists
PGPASSWORD=rahasia psql -h localhost -U hihaqqi -d kosmanage -c "\d \"Customer\"" | grep checkoutDate > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ checkoutDate column verified in database"
else
    echo "⚠️  Warning: checkoutDate column not found. This might be okay if it was already added."
fi

echo ""
echo "🔨 Step 3: Building application..."
npm run build

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Restart your application server"
echo "2. Test the dashboard at /"
echo "3. Test customer checkout at /customers"
echo "4. Monitor logs for any errors"
echo ""
echo "🔍 To check logs, run:"
echo "   journalctl -u your-app-name -f"
echo ""

# Optional: Restart service if using systemd
# read -p "Restart the application service now? (y/n) " -n 1 -r
# echo
# if [[ $REPLY =~ ^[Yy]$ ]]; then
#     sudo systemctl restart biztrackkos
#     echo "✅ Service restarted"
# fi
