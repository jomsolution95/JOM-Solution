#!/bin/bash

# Configuration
BACKUP_ROOT="/var/backups/jom-solution"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="$BACKUP_ROOT/$TIMESTAMP"
PROJECT_DIR="/var/www/jom-solution/backend"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting Backup..."

# 1. Backup MongoDB
# We use docker exec to run mongodump inside the container, streaming the archive to the host
echo "Backing up MongoDB..."
docker exec backend-mongodb-1 sh -c 'exec mongodump --username $MONGO_INITDB_ROOT_USERNAME --password $MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase admin --archive' > "$BACKUP_DIR/mongodb_dump.archive"

if [ $? -eq 0 ]; then
    echo "MongoDB Backup Successful."
else
    echo "MongoDB Backup FAILED!"
fi

# 2. Backup Uploads (Files)
echo "Backing up Uploads..."
if [ -d "$PROJECT_DIR/uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads.tar.gz" -C "$PROJECT_DIR" uploads
    echo "Uploads Backup Successful."
else
    echo "Uploads directory not found!"
fi

# 3. Compress the day's backup
echo "Compressing daily backup..."
cd "$BACKUP_ROOT"
tar -czf "$TIMESTAMP.tar.gz" "$TIMESTAMP"
rm -rf "$TIMESTAMP"

# 4. Retention Policy (Keep last 7 days)
echo "Cleaning old backups..."
find "$BACKUP_ROOT" -name "*.tar.gz" -type f -mtime +7 -delete

echo "[$(date)] Backup Completed."
