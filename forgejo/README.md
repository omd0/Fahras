# Forgejo Self-Hosted Git Platform Setup

This directory contains the configuration and setup files for the self-hosted Forgejo instance that powers the Fahras CI/CD pipeline.

## Overview

Forgejo is a self-hosted Git platform (fork of Gitea) that provides:
- Git repository hosting
- Issue tracking
- Pull requests
- Actions (CI/CD) - compatible with GitHub Actions
- Private package registries
- Container registries

## Architecture

The Forgejo setup consists of:
1. **Forgejo Application** - Main Git platform server
2. **PostgreSQL Database** - Stores metadata, issues, pull requests, etc.
3. **Act Runner** - Executes CI/CD workflows (Actions)
4. **Nginx Reverse Proxy** - Provides clean URL access

## Quick Start

### 1. Initial Setup

```bash
# Copy the environment example file
cp forgejo/.env.example forgejo/.env

# Edit forgejo/.env with your configuration
nano forgejo/.env
```

### 2. Generate Secrets

```bash
# Generate a secure secret key for Forgejo
openssl rand -base64 32

# Generate a secure database password
openssl rand -base64 24
```

### 3. Create Storage Directories

```bash
# Create storage directories
mkdir -p forgejo/data/{db,app,repos,runner,runner-cache}

# Set proper permissions
chmod -R 755 forgejo/data
```

### 4. Start Forgejo

```bash
# Start the Forgejo stack
docker-compose -f docker-compose.forgejo.yml up -d

# Check logs
docker-compose -f docker-compose.forgejo.yml logs -f forgejo
```

### 5. Initial Configuration

1. Access Forgejo at `http://localhost:3000` (or your configured domain)
2. Complete the initial setup wizard:
   - Database: Already configured via Docker
   - Admin account: Create your admin user
   - Repository root: `/data/gitea/repositories`
   - SSH domain: Your server's hostname or IP

### 6. Register Act Runner

1. Go to **Settings > Actions > Runners** in Forgejo
2. Click **New Runner**
3. Copy the registration token
4. Update `FORGEJO_RUNNER_TOKEN` in `forgejo/.env`
5. Restart the runner:
   ```bash
   docker-compose -f docker-compose.forgejo.yml restart forgejo-runner
   ```

## Configuration Files

- `docker-compose.forgejo.yml` - Main Docker Compose configuration
- `nginx-forgejo.conf` - Reverse proxy configuration
- `.env.example` - Environment variables template

## Storage Architecture

The setup uses separate volumes for different data types:

- `forgejo_db_data` - PostgreSQL database files
- `forgejo_data` - Forgejo application data (config, sessions)
- `forgejo_repos` - Git repositories
- `forgejo_runner_data` - Act Runner configuration
- `forgejo_runner_cache` - CI/CD build cache

## Networking

- **Forgejo HTTP**: Port 3000 (default)
- **Forgejo SSH**: Port 2222 (default)
- **Reverse Proxy**: Port 8080 (default)

## Backup Strategy

See `../scripts/backup-forgejo.sh` for automated backup scripts.

## Troubleshooting

### Forgejo won't start
- Check database connection: `docker-compose -f docker-compose.forgejo.yml logs forgejo-db`
- Verify environment variables in `.env`
- Check storage directory permissions

### Act Runner not connecting
- Verify `FORGEJO_RUNNER_TOKEN` is set correctly
- Check runner logs: `docker-compose -f docker-compose.forgejo.yml logs forgejo-runner`
- Ensure Forgejo is accessible from the runner container

### Repository access issues
- Check repository directory permissions
- Verify SSH key configuration
- Review Forgejo logs for specific errors

## Security Considerations

1. **Change default passwords** - Update all default credentials
2. **Use HTTPS** - Set up SSL/TLS certificates for production
3. **Firewall rules** - Restrict access to necessary ports only
4. **Regular updates** - Keep Forgejo and dependencies updated
5. **Backup encryption** - Encrypt backups before storing offsite

## Resources

- [Forgejo Documentation](https://forgejo.org/docs/)
- [Act Runner Documentation](https://forgejo.org/docs/next/admin/actions/)
- [Forgejo Actions Examples](https://codeberg.org/forgejo/forgejo/src/branch/main/.forgejo/workflows)

