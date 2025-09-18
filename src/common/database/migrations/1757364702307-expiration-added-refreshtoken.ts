import { MigrationInterface, QueryRunner } from "typeorm";

export class ExpirationAddedRefreshtoken1757364702307 implements MigrationInterface {
    name = 'ExpirationAddedRefreshtoken1757364702307'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "expiresAt" TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "expiresAt"`);
    }

}
