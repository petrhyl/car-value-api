import { MigrationInterface, QueryRunner } from "typeorm"

export class CaseInsensitiveText1758239656829 implements MigrationInterface {
    name = "CaseInsensitiveText1758239656829"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "make" TYPE citext`)
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "make" SET NOT NULL`)
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "model" TYPE citext`)
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "model" SET NOT NULL`)
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`)
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" TYPE citext`)
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`)
        await queryRunner.query(
            `ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`)
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" TYPE character varying(255)`)
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`)
        await queryRunner.query(
            `ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`
        )
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "model" TYPE character varying(100)`)
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "model" SET NOT NULL`)
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "make" TYPE character varying(100)`)
        await queryRunner.query(`ALTER TABLE "car_reports" ALTER COLUMN "make" SET NOT NULL`)
    }
}
