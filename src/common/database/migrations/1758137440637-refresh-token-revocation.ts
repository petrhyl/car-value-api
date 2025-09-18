import { MigrationInterface, QueryRunner } from "typeorm"

export class RefreshTokenRevocation1758137440637 implements MigrationInterface {
    name = "RefreshTokenRevocation1758137440637"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "familyId" uuid NOT NULL`)
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "replacedByTokenId" bigint`)
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "revokedAt" TIMESTAMP`)
        await queryRunner.query(
            `ALTER TABLE "refresh_tokens" ALTER COLUMN "clientId" TYPE character varying(64)`
        )
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "clientId" SET NOT NULL`)
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "price" TYPE numeric(14,4)`)
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "price" SET NOT NULL`)
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "make" TYPE character varying(100)`)
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "make" SET NOT NULL`)
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "model" TYPE character varying(100)`)
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "model" SET NOT NULL`)
        await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7"`)
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "name" TYPE character varying(50)`)
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "name" SET NOT NULL`)
        await queryRunner.query(
            `ALTER TABLE "roles" ADD CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name")`
        )
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "description" TYPE character varying(255)`)
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "description" SET NOT NULL`)
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`)
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" TYPE character varying(255)`)
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`)
        await queryRunner.query(
            `ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`
        )
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "name" TYPE character varying(255)`)
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL`)
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "nickname" TYPE character varying(255)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "nickname" TYPE character varying`)
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "name" TYPE character varying`)
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL`)
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`)
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" TYPE character varying`)
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`)
        await queryRunner.query(
            `ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`
        )
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "description" TYPE character varying`)
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "description" SET NOT NULL`)
        await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7"`)
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "name" TYPE character varying`)
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "name" SET NOT NULL`)
        await queryRunner.query(
            `ALTER TABLE "roles" ADD CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name")`
        )
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "model" TYPE character varying`)
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "model" SET NOT NULL`)
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "make" TYPE character varying`)
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "make" SET NOT NULL`)
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "price" TYPE integer`)
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "price" SET NOT NULL`)
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "clientId" TYPE character varying`)
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "clientId" SET NOT NULL`)
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "revokedAt"`)
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "replacedByTokenId"`)
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "familyId"`)
    }
}
