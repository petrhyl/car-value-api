import { MigrationInterface, QueryRunner } from "typeorm"

export class FixTimestampType1758140509856 implements MigrationInterface {
    name = "FixTimestampType1758140509856"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "refresh_tokens" ALTER COLUMN "revokedAt" TYPE TIMESTAMP WITH TIME ZONE`
        )
        await queryRunner.query(
            `ALTER TABLE "refresh_tokens" ALTER COLUMN "expiresAt" TYPE TIMESTAMP WITH TIME ZONE`
        )
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "expiresAt" SET NOT NULL`)
        await queryRunner.query(
            `ALTER TABLE "refresh_tokens" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE`
        )
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "createdAt" SET NOT NULL`)
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "createdAt" SET DEFAULT now()`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "createdAt" TYPE TIMESTAMP`)
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "createdAt" SET DEFAULT now()`)
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "createdAt" SET NOT NULL`)
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "expiresAt" TYPE TIMESTAMP`)
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "expiresAt" SET NOT NULL`)
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "revokedAt" TYPE TIMESTAMP`)
    }
}
