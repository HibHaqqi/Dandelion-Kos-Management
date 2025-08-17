# Simple Auto Deploy Setup

This will automatically deploy your app when you push to the main/master branch.

## Setup Steps

### Add these secrets to your Gitea repository:

Go to: **Repository Settings → Secrets → Actions**

| Secret Name | Value | Example |
|-------------|-------|---------|
| `VPS_HOST` | Your VPS IP or domain | `192.168.1.100` |
| `VPS_USERNAME` | SSH username | `root` |
| `VPS_PASSWORD` | SSH password | `your_password` |
| `PROJECT_PATH` | Project path on VPS | `/home/haqqi09/biztrackkos-2` |

### Make sure your VPS has:

- Docker and Docker Compose installed
- Your project cloned in the correct path
- `.env` file with your configuration

## How it works

When you push to main/master branch:
1. Connects to your VPS using username/password
2. Pulls latest code: `git pull`
3. Stops containers: `docker-compose down`
4. Rebuilds and starts: `docker-compose up -d --build`

That's it! No SSH keys needed - just username and password.