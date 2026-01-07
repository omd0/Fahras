#!/bin/bash

# Script to sync organization-config.yml to various locations
# This ensures the config file is available where needed

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="$PROJECT_ROOT/organization-config.yml"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: organization-config.yml not found at $CONFIG_FILE"
    exit 1
fi

echo "Syncing organization-config.yml..."

# Copy to web public directory (for frontend access)
if [ -d "$PROJECT_ROOT/web/public" ]; then
    cp "$CONFIG_FILE" "$PROJECT_ROOT/web/public/organization-config.yml"
    echo "✓ Copied to web/public/"
else
    echo "⚠ web/public/ directory not found, skipping..."
fi

# The backend can access it directly from the project root
# No need to copy since it's already at ../organization-config.yml relative to api/

echo "✓ Sync complete!"

