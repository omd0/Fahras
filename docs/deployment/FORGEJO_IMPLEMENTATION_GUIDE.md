# Forgejo Self-Hosted CI/CD Implementation Guide

This guide documents the complete implementation of the self-hosted Forgejo ecosystem for the Fahras project, following the roadmap in `dev/githubLike-Implemention.plan.md`.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Phase 1: Infrastructure Setup](#phase-1-infrastructure-setup)
3. [Phase 2: Forgejo Configuration](#phase-2-forgejo-configuration)
4. [Phase 3: CI/CD Pipeline](#phase-3-cicd-pipeline)
5. [Phase 4: Integration](#phase-4-integration)
6. [Phase 5: Backup & Recovery](#phase-5-backup--recovery)
7. [Troubleshooting](#troubleshooting)

## Overview

This implementation provides a complete self-hosted Git platform with CI/CD capabilities using:
- **Forgejo** - Git hosting platform (Gitea fork)
- **PostgreSQL** - Database for Forgejo metadata
- **Act Runner** - CI/CD worker (GitHub Actions compatible)
- **Docker** - Containerization for all services

## Phase 1: Infrastructure Setup

### Prerequisites

- Docker and Docker Compose installed
- At least 4GB RAM available
- 20GB+ disk space for repositories and builds

### Quick Start

```bash
# 1. Run the setup script
./scripts/setup-forgejo.sh

# 2. Review and update environment variables
nano forgejo/.env

# 3. Start Forgejo stack
docker-compose -f docker-compose.forgejo.yml up -d

# 4. Check status
docker-compose -f docker-compose.forgejo.yml ps
```

### Architecture

```
┌─────────────────────────────────────────┐
│         Nginx Reverse Proxy             │
│         (Port 8080)                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Forgejo Application             │
│         (Port 3000)                     │
│  - Git Repositories                     │
│  - Issues & PRs                         │
│  - Actions (CI/CD)                      │
└──────┬──────────────────┬───────────────┘
       │                  │
┌──────▼──────┐  ┌────────▼────────┐
│ PostgreSQL  │  │   Act Runner    │
│  Database   │  │   (CI/CD)       │
└─────────────┘  └─────────────────┘
```

### Storage Volumes

- `forgejo_db_data` - PostgreSQL database files
- `forgejo_data` - Application data (config, sessions)
- `forgejo_repos` - Git repositories
- `forgejo_runner_data` - Runner configuration
- `forgejo_runner_cache` - Build cache

## Phase 2: Forgejo Configuration

### Initial Setup

1. **Access Forgejo**: Navigate to `http://localhost:3000`
2. **Complete Setup Wizard**:
   - Database: `forgejo-db:5432`
   - Database name: `forgejo` (or your configured name)
   - Username/Password: From your `.env` file
   - Repository root: `/data/gitea/repositories`
   - SSH domain: Your server hostname or IP

3. **Create Organization**:
   ```
   Name: Fahras-Org
   Description: Fahras Project Organization
   ```
   
   > **Note**: Organization details are now centralized in `organization-config.yml`. 
   > See `ORGANIZATION_CONFIG_README.md` for configuration details and usage across the project.

4. **Create Repositories**:
   - `fahras-api` - Laravel Backend
   - `fahras-web` - React Frontend (wait for frontend work)
   - `fahras-docs` - Documentation

### Act Runner Registration

1. Go to **Settings > Actions > Runners**
2. Click **New Runner**
3. Copy the registration token
4. Update `FORGEJO_RUNNER_TOKEN` in `forgejo/.env`
5. Restart runner:
   ```bash
   docker-compose -f docker-compose.forgejo.yml restart forgejo-runner
   ```

### Configure Secrets

In each repository, go to **Settings > Secrets** and add:

- `POSTGRES_PASSWORD` - Database password for CI tests
- `DB_PASSWORD` - Laravel database password
- `CONTAINER_REGISTRY_URL` - Docker registry URL (if using)
- `CONTAINER_REGISTRY_USERNAME` - Registry username
- `CONTAINER_REGISTRY_PASSWORD` - Registry password

## Phase 3: CI/CD Pipeline

### Workflow Files

All workflow files are located in `api/.forgejo/workflows/`:

1. **ci.yml** - Main CI pipeline
   - Runs on push/PR to main/develop
   - Tests with PHPUnit
   - Code quality checks
   - Security audits

2. **dependency-audit.yml** - Dependency security scanning
   - Runs weekly (Monday 2 AM UTC)
   - Checks for outdated packages
   - Security vulnerability scanning

3. **build-release.yml** - Release builds
   - Triggers on version tags (v*)
   - Creates production artifacts
   - Builds Docker images

### Testing Setup

The Laravel backend includes:

- **PHPUnit Configuration**: `api/phpunit.xml`
- **Test Structure**:
  - `tests/Unit/` - Unit tests
  - `tests/Feature/` - Feature/integration tests

### Running Tests Locally

```bash
cd api
composer install
php artisan test
```

### CI Workflow Features

- **Parallel Testing**: Uses Laravel's parallel testing
- **Database Migrations**: Automatic migration in CI
- **Caching**: Composer dependencies cached
- **Service Containers**: PostgreSQL and Redis for testing

## Phase 4: Integration

### Container Registry

Forgejo includes a built-in Docker registry. To enable:

1. Go to **Repository Settings > Repository Settings**
2. Enable **"Enable Container Registry"**
3. Push images:
   ```bash
   docker tag fahras-api:latest forgejo.local:3000/fahras-org/fahras-api:latest
   docker login forgejo.local:3000
   docker push forgejo.local:3000/fahras-org/fahras-api:latest
   ```

### Private Package Registry

Forgejo supports Composer and NPM registries:

- **Composer**: Configure in `composer.json`
- **NPM**: Configure in `.npmrc`

### Webhooks

Configure webhooks in **Repository Settings > Webhooks**:
- Discord notifications
- Telegram notifications
- Custom endpoints

## Phase 5: Backup & Recovery

### Automated Backups

Run the backup script:

```bash
./scripts/backup-forgejo.sh
```

This creates:
- Database dump
- Application data archive
- Configuration backup
- Combined archive with timestamp

### Backup Schedule

Add to crontab for daily backups:

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/scripts/backup-forgejo.sh
```

### Restore Procedure

1. Stop Forgejo:
   ```bash
   docker-compose -f docker-compose.forgejo.yml down
   ```

2. Restore database:
   ```bash
   docker-compose -f docker-compose.forgejo.yml up -d forgejo-db
   docker-compose -f docker-compose.forgejo.yml exec -T forgejo-db \
     psql -U forgejo forgejo < backup_database.sql
   ```

3. Restore data:
   ```bash
   tar -xzf backup_data.tar.gz -C forgejo/data/
   ```

4. Restart services:
   ```bash
   docker-compose -f docker-compose.forgejo.yml up -d
   ```

## Troubleshooting

### Forgejo Won't Start

```bash
# Check logs
docker-compose -f docker-compose.forgejo.yml logs forgejo

# Check database connection
docker-compose -f docker-compose.forgejo.yml logs forgejo-db

# Verify environment variables
cat forgejo/.env
```

### Act Runner Not Connecting

```bash
# Check runner logs
docker-compose -f docker-compose.forgejo.yml logs forgejo-runner

# Verify token
grep FORGEJO_RUNNER_TOKEN forgejo/.env

# Restart runner
docker-compose -f docker-compose.forgejo.yml restart forgejo-runner
```

### CI Workflows Not Running

1. Verify runner is registered and online
2. Check workflow syntax in `.forgejo/workflows/`
3. Review workflow logs in Forgejo UI
4. Ensure secrets are configured

### Performance Issues

- **Database**: Increase PostgreSQL memory limits
- **Runner**: Add more CPU/memory to runner container
- **Cache**: Ensure runner cache volume has sufficient space

## Next Steps

### Backend (Current Focus)

- ✅ Infrastructure setup
- ✅ CI/CD workflows
- ✅ Test framework
- ⏳ Expand test coverage
- ⏳ Add more workflow jobs (deployment, etc.)

### Frontend (Wait for Frontend Work)

- ⏳ Create frontend CI/CD workflows
- ⏳ Set up Vitest/Jest testing
- ⏳ Build and deployment automation

## Resources

- [Forgejo Documentation](https://forgejo.org/docs/)
- [Act Runner Documentation](https://forgejo.org/docs/next/admin/actions/)
- [GitHub Actions Syntax](https://docs.github.com/en/actions) (compatible with Forgejo)
- [Laravel Testing](https://laravel.com/docs/testing)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Forgejo logs
3. Consult Forgejo documentation
4. Check workflow logs in Forgejo UI

