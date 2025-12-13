import { Injectable, Logger } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class MigrationService {
    private readonly logger = new Logger(MigrationService.name);

    constructor(@InjectConnection() private connection: Connection) { }

    /**
     * Run all pending migrations
     */
    async runMigrations(): Promise<void> {
        this.logger.log('Starting database migrations...');

        try {
            await this.createMigrationsCollection();
            await this.migration001_AddPremiumFields();
            await this.migration002_AddBoostIndexes();
            await this.migration003_AddQuotaFields();
            await this.migration004_AddCertificateFields();

            this.logger.log('All migrations completed successfully!');
        } catch (error) {
            this.logger.error('Migration failed:', error);
            throw error;
        }
    }

    /**
     * Create migrations tracking collection
     */
    private async createMigrationsCollection(): Promise<void> {
        const collections = await this.connection.db!.listCollections().toArray();
        const exists = collections.some((col) => col.name === 'migrations');

        if (!exists) {
            await this.connection.db!.createCollection('migrations');
            this.logger.log('✓ Created migrations collection');
        }
    }

    /**
     * Check if migration has been run
     */
    private async hasMigrationRun(name: string): Promise<boolean> {
        const migration = await this.connection.db!
            .collection('migrations')
            .findOne({ name });
        return !!migration;
    }

    /**
     * Mark migration as completed
     */
    private async markMigrationComplete(name: string): Promise<void> {
        await this.connection.db!.collection('migrations').insertOne({
            name,
            completedAt: new Date(),
        });
    }

    /**
     * Migration 001: Add premium fields to users
     */
    private async migration001_AddPremiumFields(): Promise<void> {
        const name = '001_add_premium_fields';
        if (await this.hasMigrationRun(name)) {
            this.logger.log(`✓ Migration ${name} already run, skipping...`);
            return;
        }

        this.logger.log(`Running migration: ${name}`);

        await this.connection.db!.collection('users').updateMany(
            { verified: { $exists: false } },
            {
                $set: {
                    verified: false,
                    premiumUntil: null,
                },
            },
        );

        await this.markMigrationComplete(name);
        this.logger.log(`✓ Migration ${name} completed`);
    }

    /**
     * Migration 002: Add indexes for boosts
     */
    private async migration002_AddBoostIndexes(): Promise<void> {
        const name = '002_add_boost_indexes';
        if (await this.hasMigrationRun(name)) {
            this.logger.log(`✓ Migration ${name} already run, skipping...`);
            return;
        }

        this.logger.log(`Running migration: ${name}`);

        await this.connection.db!.collection('boosts').createIndexes([
            { key: { userId: 1, active: 1 } },
            { key: { type: 1, active: 1 } },
            { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
        ]);

        await this.markMigrationComplete(name);
        this.logger.log(`✓ Migration ${name} completed`);
    }

    /**
     * Migration 003: Add quota fields
     */
    private async migration003_AddQuotaFields(): Promise<void> {
        const name = '003_add_quota_fields';
        if (await this.hasMigrationRun(name)) {
            this.logger.log(`✓ Migration ${name} already run, skipping...`);
            return;
        }

        this.logger.log(`Running migration: ${name}`);

        await this.connection.db!.collection('premiumquotas').updateMany(
            { resetDate: { $exists: false } },
            {
                $set: {
                    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
                },
            },
        );

        await this.markMigrationComplete(name);
        this.logger.log(`✓ Migration ${name} completed`);
    }

    /**
     * Migration 004: Add certificate verification fields
     */
    private async migration004_AddCertificateFields(): Promise<void> {
        const name = '004_add_certificate_fields';
        if (await this.hasMigrationRun(name)) {
            this.logger.log(`✓ Migration ${name} already run, skipping...`);
            return;
        }

        this.logger.log(`Running migration: ${name}`);

        await this.connection.db!.collection('certificates').updateMany(
            { verificationCode: { $exists: false } },
            [
                {
                    $set: {
                        verificationCode: {
                            $concat: ['CERT-', { $toString: '$_id' }],
                        },
                    },
                },
            ],
        );

        await this.markMigrationComplete(name);
        this.logger.log(`✓ Migration ${name} completed`);
    }
}

// Standalone migration script
async function runMigrations() {
    const { NestFactory } = require('@nestjs/core');
    const { AppModule } = require('../app.module');

    const app = await NestFactory.createApplicationContext(AppModule);
    const migrationService = app.get(MigrationService);

    try {
        await migrationService.runMigrations();
        console.log('✓ Migrations completed successfully');
    } catch (error) {
        console.error('✗ Migrations failed:', error);
        process.exit(1);
    } finally {
        await app.close();
    }
}

// Run if executed directly
if (require.main === module) {
    runMigrations();
}

export default MigrationService;
