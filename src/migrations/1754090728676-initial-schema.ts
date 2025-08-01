import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1754090728676 implements MigrationInterface {
    name = 'InitialSchema1754090728676'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tokenHash" varchar NOT NULL, "clientId" varchar NOT NULL, "userId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`CREATE TABLE "car_reports" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "creatorId" integer NOT NULL, "price" integer NOT NULL, "make" varchar NOT NULL, "model" varchar NOT NULL, "year" integer NOT NULL, "longitude" float NOT NULL, "latitude" float NOT NULL, "mileage" integer NOT NULL, "approved" boolean NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "name" varchar NOT NULL, "nickname" varchar, "passwordHash" varchar NOT NULL, "tokenVersion" integer NOT NULL DEFAULT (0), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "user_roles" ("usersId" integer NOT NULL, "rolesId" integer NOT NULL, PRIMARY KEY ("usersId", "rolesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_99b019339f52c63ae615358738" ON "user_roles" ("usersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_13380e7efec83468d73fc37938" ON "user_roles" ("rolesId") `);
        await queryRunner.query(`CREATE TABLE "temporary_refresh_tokens" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tokenHash" varchar NOT NULL, "clientId" varchar NOT NULL, "userId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_refresh_tokens"("id", "tokenHash", "clientId", "userId", "createdAt") SELECT "id", "tokenHash", "clientId", "userId", "createdAt" FROM "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`ALTER TABLE "temporary_refresh_tokens" RENAME TO "refresh_tokens"`);
        await queryRunner.query(`CREATE TABLE "temporary_car_reports" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "creatorId" integer NOT NULL, "price" integer NOT NULL, "make" varchar NOT NULL, "model" varchar NOT NULL, "year" integer NOT NULL, "longitude" float NOT NULL, "latitude" float NOT NULL, "mileage" integer NOT NULL, "approved" boolean NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "FK_722d7ab62311bba6aed4551c5eb" FOREIGN KEY ("creatorId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_car_reports"("id", "creatorId", "price", "make", "model", "year", "longitude", "latitude", "mileage", "approved", "createdAt") SELECT "id", "creatorId", "price", "make", "model", "year", "longitude", "latitude", "mileage", "approved", "createdAt" FROM "car_reports"`);
        await queryRunner.query(`DROP TABLE "car_reports"`);
        await queryRunner.query(`ALTER TABLE "temporary_car_reports" RENAME TO "car_reports"`);
        await queryRunner.query(`DROP INDEX "IDX_99b019339f52c63ae615358738"`);
        await queryRunner.query(`DROP INDEX "IDX_13380e7efec83468d73fc37938"`);
        await queryRunner.query(`CREATE TABLE "temporary_user_roles" ("usersId" integer NOT NULL, "rolesId" integer NOT NULL, CONSTRAINT "FK_99b019339f52c63ae6153587380" FOREIGN KEY ("usersId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_13380e7efec83468d73fc37938e" FOREIGN KEY ("rolesId") REFERENCES "roles" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("usersId", "rolesId"))`);
        await queryRunner.query(`INSERT INTO "temporary_user_roles"("usersId", "rolesId") SELECT "usersId", "rolesId" FROM "user_roles"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`ALTER TABLE "temporary_user_roles" RENAME TO "user_roles"`);
        await queryRunner.query(`CREATE INDEX "IDX_99b019339f52c63ae615358738" ON "user_roles" ("usersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_13380e7efec83468d73fc37938" ON "user_roles" ("rolesId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_13380e7efec83468d73fc37938"`);
        await queryRunner.query(`DROP INDEX "IDX_99b019339f52c63ae615358738"`);
        await queryRunner.query(`ALTER TABLE "user_roles" RENAME TO "temporary_user_roles"`);
        await queryRunner.query(`CREATE TABLE "user_roles" ("usersId" integer NOT NULL, "rolesId" integer NOT NULL, PRIMARY KEY ("usersId", "rolesId"))`);
        await queryRunner.query(`INSERT INTO "user_roles"("usersId", "rolesId") SELECT "usersId", "rolesId" FROM "temporary_user_roles"`);
        await queryRunner.query(`DROP TABLE "temporary_user_roles"`);
        await queryRunner.query(`CREATE INDEX "IDX_13380e7efec83468d73fc37938" ON "user_roles" ("rolesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_99b019339f52c63ae615358738" ON "user_roles" ("usersId") `);
        await queryRunner.query(`ALTER TABLE "car_reports" RENAME TO "temporary_car_reports"`);
        await queryRunner.query(`CREATE TABLE "car_reports" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "creatorId" integer NOT NULL, "price" integer NOT NULL, "make" varchar NOT NULL, "model" varchar NOT NULL, "year" integer NOT NULL, "longitude" float NOT NULL, "latitude" float NOT NULL, "mileage" integer NOT NULL, "approved" boolean NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`INSERT INTO "car_reports"("id", "creatorId", "price", "make", "model", "year", "longitude", "latitude", "mileage", "approved", "createdAt") SELECT "id", "creatorId", "price", "make", "model", "year", "longitude", "latitude", "mileage", "approved", "createdAt" FROM "temporary_car_reports"`);
        await queryRunner.query(`DROP TABLE "temporary_car_reports"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" RENAME TO "temporary_refresh_tokens"`);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tokenHash" varchar NOT NULL, "clientId" varchar NOT NULL, "userId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`INSERT INTO "refresh_tokens"("id", "tokenHash", "clientId", "userId", "createdAt") SELECT "id", "tokenHash", "clientId", "userId", "createdAt" FROM "temporary_refresh_tokens"`);
        await queryRunner.query(`DROP TABLE "temporary_refresh_tokens"`);
        await queryRunner.query(`DROP INDEX "IDX_13380e7efec83468d73fc37938"`);
        await queryRunner.query(`DROP INDEX "IDX_99b019339f52c63ae615358738"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "car_reports"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    }

}
