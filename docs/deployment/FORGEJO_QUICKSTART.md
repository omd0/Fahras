# Forgejo Quick Start Guide

Get your self-hosted Forgejo CI/CD platform running in minutes!

## 🚀 Quick Setup (5 Minutes)

### Step 1: Run Setup Script

```bash
cd /home/omd/Documents/CTI/Fahras
./scripts/setup-forgejo.sh
```

This will:
- Create necessary directories
- Generate secure secrets
- Prepare configuration files

### Step 2: Review Configuration

```bash
# Edit environment variables if needed
nano forgejo/.env
```

Key settings to check:
- `FORGEJO_DOMAIN` - Your domain or IP
- `FORGEJO_HTTP_PORT` - Port for Forgejo (default: 3000)
- Database passwords (auto-generated)

### Step 3: Start Forgejo

```bash
docker-compose -f docker-compose.forgejo.yml up -d
```

### Step 4: Access Forgejo

Open your browser:
```
http://localhost:3000
```

### Step 5: Initial Configuration

1. **Complete Setup Wizard**:
   - Database: `forgejo-db:5432`
   - Database name: `forgejo`
   - Username/Password: From `forgejo/.env`
   - Repository root: `/data/gitea/repositories`
   - Create admin account

2. **Create Organization**:
   - Go to: `http://localhost:3000/org/create`
   - Name: `Fahras-Org`

3. **Create Repository**:
   - In Fahras-Org, create: `fahras-api`
   - Initialize with your Laravel backend code

4. **Register Act Runner**:
   - Go to: Settings > Actions > Runners
   - Click "New Runner"
   - Copy token
   - Update `FORGEJO_RUNNER_TOKEN` in `forgejo/.env`
   - Restart: `docker-compose -f docker-compose.forgejo.yml restart forgejo-runner`

5. **Configure Secrets**:
   - In repository: Settings > Secrets
   - Add: `POSTGRES_PASSWORD` (for CI tests)
   - Add: `DB_PASSWORD` (for CI tests)

## ✅ Verify Installation

```bash
# Check all services are running
docker-compose -f docker-compose.forgejo.yml ps

# Check Forgejo logs
docker-compose -f docker-compose.forgejo.yml logs -f forgejo

# Check Act Runner logs
docker-compose -f docker-compose.forgejo.yml logs -f forgejo-runner
```

## 🧪 Test CI/CD Pipeline

1. Push code to your `fahras-api` repository
2. Go to: Actions tab in Forgejo
3. Watch the workflow run!

## 📚 Next Steps

- Read `FORGEJO_IMPLEMENTATION_GUIDE.md` for detailed documentation
- Review `api/.forgejo/workflows/ci.yml` for CI configuration
- Set up automated backups: `./scripts/backup-forgejo.sh`

## 🆘 Troubleshooting

**Forgejo won't start?**
```bash
docker-compose -f docker-compose.forgejo.yml logs forgejo
```

**Runner not connecting?**
```bash
# Check token is set
grep FORGEJO_RUNNER_TOKEN forgejo/.env

# Restart runner
docker-compose -f docker-compose.forgejo.yml restart forgejo-runner
```

**Need help?**
- Check `FORGEJO_IMPLEMENTATION_GUIDE.md`
- Review Forgejo logs
- Check workflow logs in Forgejo UI

## 🎉 You're Done!

Your self-hosted Git platform with CI/CD is now running!

