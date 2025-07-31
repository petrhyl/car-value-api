import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication, ValidationPipe } from "@nestjs/common"
import * as request from "supertest"
import { App } from "supertest/types"
import { AppModule } from "./../src/app.module"
import { UserDto } from "@/users/dtos/user.dto"
import { DataSource } from "typeorm"
import { RoleName } from "@/users/role.entity"
import { AppSeeder } from "@/app.seeder"
import { UserAuthDto } from "@/auth/dtos/user-auth.dto"

describe("AuthController (e2e)", () => {
    jest.setTimeout(180000)
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
        app.setGlobalPrefix("api")
        ;(app.getHttpAdapter().getInstance() as import("express").Express).set("query parser", "extended")
        ;(app.getHttpAdapter().getInstance() as import("express").Express).disable("x-powered-by")

        await app.init()
    })

    afterAll(async () => {
        await app.close()
    })

    describe("POST api/auth/signup and POST api/auth/login", () => {
        beforeAll(async () => {
            const dataSource = app.get<DataSource>(DataSource)
            await dataSource.synchronize(true) // Reset the database before each test

            const seeder = app.get(AppSeeder)
            await seeder.onApplicationBootstrap()
        })

        const email = "test2@example.com"

        it("should register new user with default role", async () => {
            const response = await request(app.getHttpServer())
                .post("/api/auth/signup")
                .send({
                    email,
                    name: "Test User",
                    password: "StrongPassword123*"
                })
                .expect(201)

            expect(response.body).toHaveProperty("id")
            expect((response.body as UserDto).email).toBe(email)
            expect((response.body as UserDto).roles).toHaveLength(1)
            expect((response.body as UserDto).roles[0]).toBe(RoleName.USER)
        })

        it("should return access token on successful login", async () => {
            const response = await request(app.getHttpServer())
                .post("/api/auth/login")
                .send({
                    email,
                    password: "StrongPassword123*",
                    clientId: "test-client"
                })
                .expect(200)

            expect(response.body).toHaveProperty("accessToken")
            expect(response.body).toHaveProperty("refreshToken")
        })

        it("should not allow login with incorrect password", async () => {
            const response = await request(app.getHttpServer())
                .post("/api/auth/login")
                .send({
                    email,
                    password: "WrongPassword",
                    clientId: "test-client"
                })
                .expect(401)

            expect(response.body).toHaveProperty("statusCode", 401)
            expect(response.body).toHaveProperty("message", "Invalid credentials")
        })

        it("should return new access token on refresh", async () => {
            const loginResponse: request.Response = await request(app.getHttpServer())
                .post("/api/auth/login")
                .send({
                    email,
                    password: "StrongPassword123*",
                    clientId: "test-client"
                })
                .expect(200)

            const loginResponseBody = loginResponse.body as UserAuthDto

            const refreshResponse = await request(app.getHttpServer())
                .post("/api/auth/refresh-token")
                .send({
                    userId: loginResponseBody.id,
                    refreshToken: loginResponseBody.refreshToken,
                    clientId: "test-client"
                })
                .expect(200)

            expect(refreshResponse.body).toHaveProperty("accessToken")
            expect(refreshResponse.body).toHaveProperty("refreshToken")
            expect((refreshResponse.body as { accessToken: string }).accessToken).not.toBe(
                loginResponseBody.accessToken
            )
        })

        it("should not allow duplicate email registration", async () => {
            const response = await request(app.getHttpServer())
                .post("/api/auth/signup")
                .send({
                    email,
                    name: "Test User",
                    password: "StrongPassword123*"
                })
                .expect(422)

            expect(response.body).toHaveProperty("statusCode", 422)
            expect(response.body).toHaveProperty("message", "User with this e-mail already exists")
        })

        it("should not allow registration with weak password", async () => {
            const response = await request(app.getHttpServer())
                .post("/api/auth/signup")
                .send({
                    email: "test2@example.com",
                    name: "Test User",
                    password: "weak"
                })
                .expect(400)

            expect(response.body).toHaveProperty("statusCode", 400)
            expect((response.body as { message: string[] }).message).toBeDefined()
            expect((response.body as { message: string[] }).message).toContain(
                "password is not strong enough"
            )
        })

        it("should not allow registration with missing fields", async () => {
            const response = await request(app.getHttpServer())
                .post("/api/auth/signup")
                .send({
                    name: "Test User",
                    password: "StrongPassword123*"
                })
                .expect(400)

            expect(response.body).toHaveProperty("statusCode", 400)
            expect((response.body as { message: string[] }).message).toBeDefined()
            expect((response.body as { message: string[] }).message).toContain("email must be an email")
        })

        it("should not allow registration with invalid email", async () => {
            const response = await request(app.getHttpServer())
                .post("/api/auth/signup")
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
