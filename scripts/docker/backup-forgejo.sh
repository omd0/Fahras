#!/bin/bash
# Forgejo Backup Script
# Phase 5: Automated Backups (3-2-1 Strategy)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FORGEJO_DIR="$PROJECT_ROOT/forgejo"
BACKUP_DIR="${FORGEJO_BACKUP_DIR:-$PROJECT_ROOT/forgejo/backups}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="forgejo_backup_$DATE"

echo "💾 Starting Forgejo Backup"
echo "=========================="

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Load environment variables
if [ -f "$FORGEJO_DIR/.env" ]; then
    source "$FORGEJO_DIR/.env"
fi

# Backup database
echo "📊 Backing up PostgreSQL database..."
docker-compose -f "$PROJECT_ROOT/docker-compose.forgejo.yml" exec -T forgejo-db \
    pg_dump -U "${FORGEJO_DB_USER:-forgejo}" "${FORGEJO_DB_NAME:-forgejo}" \
    > "$BACKUP_DIR/${BACKUP_NAME}_database.sql"

# Backup application data
echo "📁 Backing up application data..."
tar -czf "$BACKUP_DIR/${BACKUP_NAME}_data.tar.gz" \
    -C "$FORGEJO_DIR/data" \
    app repos runner \
    2>/dev/null || true

# Backup configuration
echo "⚙️  Backing up configuration..."
tar -czf "$BACKUP_DIR/${BACKUP_NAME}_config.tar.gz" \
    -C "$FORGEJO_DIR" \
    .env nginx-forgejo.conf \
    2>/dev/null || true

# Create combined backup archive
echo "📦 Creating combined backup archive..."
cd "$BACKUP_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" \
    "${BACKUP_NAME}_database.sql" \
    "${BACKUP_NAME}_data.tar.gz" \
    "${BACKUP_NAME}_config.tar.gz"

# Clean up individual files
rm -f "${BACKUP_NAME}_database.sql" \
      "${BACKUP_NAME}_data.tar.gz" \
      "${BACKUP_NAME}_config.tar.gz"

# Calculate backup size
BACKUP_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)

echo "✅ Backup completed: ${BACKUP_NAME}.tar.gz ($BACKUP_SIZE)"
echo "📍 Location: $BACKUP_DIR"

# Cleanup old backups (keep last 30 days)
echo "🧹 Cleaning up old backups..."
find "$BACKUP_DIR" -name "forgejo_backup_*.tar.gz" -mtime +30 -delete

# Optional: Upload to remote storage (implement based on your needs)
if [ -n "$FORGEJO_BACKUP_REMOTE" ]; then
    echo "☁️  Uploading to remote storage..."
    # Add your remote backup logic here
    # Example: rsync, S3, etc.
fi

echo "✅ Backup process complete!"

