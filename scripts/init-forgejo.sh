#!/bin/bash
# Forgejo Initialization Script
# Phase 2: Repository Organization & Configuration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🔧 Initializing Forgejo Configuration"
echo "======================================"

# Check if Forgejo is running
if ! docker ps | grep -q forgejo-app; then
    echo "⚠️  Forgejo is not running. Please start it first:"
    echo "   docker-compose -f docker-compose.forgejo.yml up -d"
    exit 1
fi

echo "✅ Forgejo is running"
echo ""
echo "📋 Next steps for manual configuration:"
echo ""
echo "1. Access Forgejo at http://localhost:3000"
echo "2. Complete the initial setup wizard:"
echo "   - Database: Already configured (use forgejo-db:5432)"
echo "   - Admin account: Create your admin user"
echo "   - Repository root: /data/gitea/repositories"
echo ""
echo "3. Create Organization 'Fahras-Org':"
echo "   - Go to: http://localhost:3000/org/create"
echo "   - Name: Fahras-Org"
echo "   - Description: Fahras Project Organization"
echo ""
echo "4. Create Repositories in Fahras-Org:"
echo "   - fahras-api (Laravel Backend)"
echo "   - fahras-web (React Frontend)"
echo "   - fahras-docs (Documentation)"
echo ""
echo "5. Register Act Runner:"
echo "   - Go to: Settings > Actions > Runners"
echo "   - Click 'New Runner'"
echo "   - Copy the registration token"
echo "   - Update FORGEJO_RUNNER_TOKEN in forgejo/.env"
echo "   - Restart runner: docker-compose -f docker-compose.forgejo.yml restart forgejo-runner"
echo ""
echo "6. Configure Secrets in Forgejo:"
echo "   - Go to: Repository Settings > Secrets"
echo "   - Add: POSTGRES_PASSWORD (for CI tests)"
echo "   - Add: DB_PASSWORD (for CI tests)"
echo "   - Add: CONTAINER_REGISTRY_URL (for Docker builds)"
echo "   - Add: CONTAINER_REGISTRY_USERNAME"
echo "   - Add: CONTAINER_REGISTRY_PASSWORD"
echo ""

