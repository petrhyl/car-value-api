import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication, ValidationPipe } from "@nestjs/common"
import * as request from "supertest"
import { App } from "supertest/types"
import { AppModule } from "./../src/app.module"
import { UserDto } from "@/users/dtos/user.dto"
import { DataSource } from "typeorm"

describe("AuthController (e2e)", () => {
    let app: INestApplication<App>

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        }).compile()

        app = moduleFixture.createNestApplication()
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true
            })
        )
        ;(app.getHttpAdapter().getInstance() as import("express").Express).disable("x-powered-by")

        await app.init()
    })

    afterAll(async () => {
        await app.close()
    })

    describe("POST /auth/signup", () => {
        beforeAll(async () => {
            const dataSource = app.get<DataSource>(DataSource)
            await dataSource.synchronize(true) // Reset the database before each test
        })

        const email = "test2@example.com"
        it("should register new user", async () => {
            const response = await request(app.getHttpServer())
                .post("/auth/signup")
                .send({
                    email,
                    name: "Test User",
                    password: "StrongPassword123*"
                })
                .expect(201)

            expect(response.body).toHaveProperty("id")
            expect((response.body as UserDto).email).toBe(email)
        })

        it("should not allow duplicate email registration", async () => {
            const response = await request(app.getHttpServer())
                .post("/auth/signup")
                .send({
                    email,
                    name: "Test User",
                    password: "StrongPassword123*"
                })
                .expect(422)

            expect(response.body).toHaveProperty("statusCode", 422)
            expect(response.body).toHaveProperty("message", "User with this e-mail already exists")
        })

        it("should not allow registration with invalid email", async () => {
            const response = await request(app.getHttpServer())
                .post("/auth/signup")
                .send({
                    email: "invalid-email",
                    name: "Test User",
                    password: "StrongPassword123*"
                })
                .expect(400)

            expect(response.body).toHaveProperty("statusCode", 400)
            expect(response.body).toHaveProperty("message", ["email must be an email"])
        })
    })
})
