# Multi-Domain Setup Guide

This document explains how the multi-domain architecture works for Dandelion Kos management system.

## Architecture Overview

The system uses a **single Next.js application** with **route groups** to serve three different interfaces based on the subdomain:

- **`dandelionkos.site`** (or `www.dandelionkos.site`) → Landing Page
- **`admin.dandelionkos.site`** → Admin Dashboard
- **`tenant.dandelionkos.site`** → Tenant Portal

## How It Works

### 1. Route Groups Structure

```
src/app/
├── (site)/                  # Landing page and public pages
│   ├── page.tsx             # Landing page
│   ├── login/               # Tenant login page
│   └── layout.tsx           # Site layout (no sidebar)
├── (dashboard)/             # Admin dashboard
│   ├── page.tsx             # Admin dashboard home
│   ├── customers/           # Customer management
│   ├── transactions/        # Transaction management
│   ├── rooms/               # Room management
│   └── layout.tsx           # Admin layout (with sidebar)
└── (tenant)/                # Tenant portal
    ├── dashboard/           # Tenant dashboard
    ├── complaints/          # Complaint management
    ├── register/            # Tenant registration
    └── layout.tsx           # Tenant layout (mobile-optimized)
```

Route groups in Next.js are wrapped in parentheses, which means:
- They organize routes without affecting the URL structure
- Each group can have its own layout
- They allow sharing data and components between groups

### 2. Middleware Subdomain Routing

The middleware (`src/middleware.ts`) handles subdomain detection and URL rewriting:

```typescript
// Extract subdomain from hostname
const subdomain = hostname.split('.')[0];

// Route to appropriate group
if (subdomain === 'admin') {
  // Admin -> (dashboard) route group
} else if (subdomain === 'tenant') {
  // Tenant -> (tenant) route group
} else {
  // Main domain -> (site) route group
}
```

### 3. Cloudflare Tunnel Configuration

All three domains point to the **same** Docker container:

| Public Hostname | Service URL |
|----------------|-------------|
| `dandelionkos.site` | `http://localhost:9002` |
| `admin.dandelionkos.site` | `http://localhost:9002` |
| `tenant.dandelionkos.site` | `http://localhost:9002` |

Cloudflare Tunnel handles:
- SSL/HTTPS certificates automatically
- Routing all domains to the same container
- No need for Nginx configuration

### 4. Local Development

To test subdomains locally:

#### Option 1: Use different ports
- `localhost:9002` → Landing page
- `localhost:9003` → Admin (not implemented)
- `localhost:9004` → Tenant (not implemented)

#### Option 2: Edit `/etc/hosts` (Linux/Mac)
Add these lines to `/etc/hosts`:
```
127.0.0.1 admin.localhost
127.0.0.1 tenant.localhost
127.0.0.1 www.localhost
```

Then access:
- `http://admin.localhost:9002` → Admin dashboard
- `http://tenant.localhost:9002` → Tenant portal
- `http://www.localhost:9002` → Landing page

#### Option 3: Use URL parameter (for testing)
Add `?subdomain=admin` or `?subdomain=tenant` to URLs (requires middleware modification)

## Benefits of This Architecture

1. **Single Codebase**: Easy to maintain and deploy
2. **Shared Database**: All interfaces access the same PostgreSQL database
3. **Shared Components**: Reusable UI components across all interfaces
4. **Type Safety**: Shared TypeScript types across all routes
5. **Easy Deployment**: One Docker container to manage
6. **Cost Effective**: Only need one VPS/server

## Deployment

### Docker Setup

The `docker-compose.yml` should have:

```yaml
services:
  app:
    build: .
    ports:
      - "9002:3000"
    environment:
      - DATABASE_URL=postgresql://...
      - NEXT_PUBLIC_SITE_URL=https://dandelionkos.site
```

### Cloudflare Tunnel Setup

1. Install `cloudflared` on your server
2. Create a tunnel:
   ```bash
   cloudflared tunnel create dandelion-kos
   ```

3. Configure the tunnel (config.yml):
   ```yaml
   tunnel: <your-tunnel-id>
   credentials-file: /path/to/credentials.json

   ingress:
     - hostname: dandelionkos.site
       service: http://localhost:9002
     - hostname: admin.dandelionkos.site
       service: http://localhost:9002
     - hostname: tenant.dandelionkos.site
       service: http://localhost:9002
     - service: http_status:404
   ```

4. Run the tunnel:
   ```bash
   cloudflared tunnel run dandelion-kos
   ```

## Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/biztrackkos"

# Site URLs (optional, for email links, etc.)
NEXT_PUBLIC_SITE_URL="https://dandelionkos.site"
NEXT_PUBLIC_ADMIN_URL="https://admin.dandelionkos.site"
NEXT_PUBLIC_TENANT_URL="https://tenant.dandelionkos.site"

# API Key for webhooks
API_KEY="your-secret-api-key"
```

## Adding New Pages

### Landing Page (public)
```bash
# Create in (site) group
src/app/(site)/about/page.tsx
# Access at: dandelionkos.site/about
```

### Admin Page
```bash
# Create in (dashboard) group
src/app/(dashboard)/reports/page.tsx
# Access at: admin.dandelionkos.site/reports
```

### Tenant Page
```bash
# Create in (tenant) group
src/app/(tenant)/payments/page.tsx
# Access at: tenant.dandelionkos.site/payments
```

## Troubleshooting

### Issue: Subdomain routing not working
- **Solution**: Check if middleware is properly detecting hostname
- Add `console.log(hostname)` in middleware to debug

### Issue: Styles not loading
- **Solution**: Make sure Tailwind is configured in `tailwind.config.ts`
- Check that `globals.css` is imported in root layout

### Issue: API routes not accessible
- **Solution**: Ensure API routes are not rewritten by middleware
- The middleware has conditions to skip `/api` routes

### Issue: Images not loading
- **Solution**: Check if image URLs are absolute paths
- Use `/uploads/` for public images in `public/` folder

## Next Steps

1. **Add custom domain**: Configure your domain DNS to point to Cloudflare
2. **Set up SSL**: Cloudflare Tunnel handles this automatically
3. **Configure authentication**: Add login flows for admin and tenant portals
4. **Test all routes**: Ensure all pages work on all three subdomains
5. **Monitor logs**: Check Docker logs for any routing issues

## Questions?

If you encounter any issues:
1. Check the browser console for errors
2. Review the middleware logs in the terminal
3. Verify DNS settings for your domains
4. Ensure Cloudflare Tunnel is running correctly
