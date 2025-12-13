#!/bin/bash

# Configuration
DB_NAME="jom_db"
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="$BACKUP_DIR/$DB_NAME-$TIMESTAMP"
S3_BUCKET="s3://your-backup-bucket"

# Ensure backup dir exists
mkdir -p $BACKUP_DIR

# Dump Database
echo "Creating backup for $DB_NAME..."
mongodump --uri="mongodb://mongo:27017/$DB_NAME" --out="$BACKUP_PATH" --gzip

if [ $? -eq 0 ]; then
  echo "Backup successful: $BACKUP_PATH"
  
  # Archive
  tar -czf "$BACKUP_PATH.tar.gz" -C "$BACKUP_DIR" "$DB_NAME-$TIMESTAMP"
  
  # Upload to S3 (Uncomment if AWS CLI is configured)
  # echo "Uploading to S3..."
  # aws s3 cp "$BACKUP_PATH.tar.gz" "$S3_BUCKET/"
  
  # Cleanup local
  rm -rf "$BACKUP_PATH"
  # rm "$BACKUP_PATH.tar.gz" # Keep latest local or implement retention policy
  
  echo "Backup process completed."
else
  echo "Backup failed!"
  exit 1
fi
