#!/bin/bash
# Clear Laravel config cache to pick up new email settings

echo "Clearing Laravel config cache..."
docker compose exec php php artisan config:clear

if [ $? -eq 0 ]; then
    echo "Config cache cleared successfully!"
    echo ""
    echo "Your email configuration should now be active."
    echo "Test it by visiting: http://localhost/api/test-email-config"
else
    echo "Failed to clear config cache."
    echo "Make sure Docker containers are running."
    exit 1
fi

