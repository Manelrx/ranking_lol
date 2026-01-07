# 🍓 Deploying RiftScore on Raspberry Pi

This guide details how to set up your Raspberry Pi (4 or 5 recommended) to host RiftScore.

## Prerequisites
- **Raspberry Pi 4 (4GB+)** or **Raspberry Pi 5**.
- **microSD Card (32GB+)**.
- **Raspberry Pi OS (64-bit)**. *Crucial: Must be 64-bit.*

## 1. System Preparation

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Setup Swap Memory (CRITICAL)
Next.js build process is memory intensive. On a 4GB/8GB Pi, you **must** increase swap to avoid crashes during `docker build`.

```bash
# 1. Turn off swap
sudo dphys-swapfile swapoff

# 2. Edit swap configuration
sudo nano /etc/dphys-swapfile
# CHANGE: CONF_SWAPSIZE=100
# TO:     CONF_SWAPSIZE=2048  (2GB)

# 3. Setup and turn on
sudo dphys-swapfile setup
sudo dphys-swapfile swapon

# 4. Verify
free -h
```

### 1.3 Install Docker & Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (avoid sudo)
sudo usermod -aG docker $USER

# Logout and Login again for changes to take effect
exit
```

## 2. Deployment

### 2.1 Transfer Files
Copy your project folder (`ranking_lol`) to the Pi. You can use `scp`, a git repo, or a USB drive.
```bash
# Example using git (if you push your code to GitHub/GitLab)
git clone https://github.com/your-username/ranking_lol.git
cd ranking_lol
```

### 2.2 Configure Environment
Copy the `.env` file and set your production keys.
```bash
cp .env .env.prod
nano .env.prod
# Update DATABASE_URL, RIOT_API_KEY, etc.
```

### 2.3 Build and Run
This step effectively compiles the application on the Pi. The first run will take time (10-20 mins) due to the Next.js build.

```bash
docker-compose up --build -d
```

### 2.4 Monitor Status
Check the logs to ensure the system Bootstraps correctly.
```bash
docker logs -f ranking_jobs
```

## 3. Maintenance

### 3.1 Logs
- **Jobs (Scheduler)**: `docker logs -f ranking_jobs`
- **Web (Frontend)**: `docker logs -f ranking_web`
- **API (Backend)**: `docker logs -f ranking_api`

### 3.2 Update Code
```bash
git pull
docker-compose up --build -d
# Docker will reuse layers only rebuilding what changed.
```
