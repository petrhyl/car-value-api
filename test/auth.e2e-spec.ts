import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication, ValidationPipe } from "@nestjs/common"
import * as request from "supertest"
import { App } from "supertest/types"
import { AppModule } from "./../src/app.module"
import { UserResponse } from "@/users/dtos/user.response"
import { DataSource } from "typeorm"
import { RoleName } from "@/users/entities/role.entity"
import { Seeder } from "@/common/database/seeder"
import { UserAuthResponse } from "@/auth/dtos/user-auth.response"
import { Express } from "express"
import AuthRedisProvider from "@/auth/store/auth.redis.provider"

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
        app.enableShutdownHooks()
        const expressApp = app.getHttpAdapter().getInstance() as Express
        expressApp.set("query parser", "extended")
        expressApp.disable("x-powered-by")

        await app.init()
    })

    afterAll(async () => {
        const redisProvider = app.get(AuthRedisProvider)
        await redisProvider.client.flushAll()

        await app.close()
    })

    describe("POST api/auth/signup and POST api/auth/login", () => {
        beforeAll(async () => {
            const dataSource = app.get<DataSource>(DataSource)
            await dataSource.synchronize(true) // Reset the database before each test

            const seeder = app.get(Seeder)
            await seeder.onApplicationBootstrap()

            const redisProvider = app.get(AuthRedisProvider)
            await redisProvider.client.flushAll()
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
            expect((response.body as UserResponse).email).toBe(email)
            expect((response.body as UserResponse).roles).toHaveLength(1)
            expect((response.body as UserResponse).roles[0]).toBe(RoleName.USER)
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

        it("should not allow login for non-existing user", async () => {
            const response = await request(app.getHttpServer())
                .post("/api/auth/login")
                .send({
                    email: "nonexistent@example.com",
                    password: "SomePassword123*",
                    clientId: "test-client"
                })
                .expect(401)

            expect(response.body).toHaveProperty("statusCode", 401)
            expect(response.body).toHaveProperty("message", "Invalid credentials")
        })

        it("should return current user info when authenticated", async () => {
            const loginResponse = await request(app.getHttpServer())
                .post("/api/auth/login")
                .send({
                    email,
                    password: "StrongPassword123*",
                    clientId: "test-client"
                })
                .expect(200)

            const loginResponseBody = loginResponse.body as UserAuthResponse

            const currentUserResponse = await request(app.getHttpServer())
                .get("/api/auth/current-user")
                .set("Authorization", `Bearer ${loginResponseBody.accessToken}`)
                .expect(200)

            expect(currentUserResponse.body).toHaveProperty("id")
            expect((currentUserResponse.body as UserResponse).email).toBe(email)
            expect((currentUserResponse.body as UserResponse).roles).toHaveLength(1)
            expect((currentUserResponse.body as UserResponse).roles[0]).toBe(RoleName.USER)
        })
    })

    describe("POST api/auth/logout and POST api/auth/refresh-token", () => {
        const email = "test@example.com"
        const password = "StrongPassword123*"

        beforeAll(async () => {
            const dataSource = app.get<DataSource>(DataSource)
            await dataSource.synchronize(true) // Reset the database before each test

            const seeder = app.get(Seeder)
            await seeder.onApplicationBootstrap()

            // Register a user to use in tests
            await request(app.getHttpServer())
                .post("/api/auth/signup")
                .send({
                    email,
                    name: "Test User",
                    password: "StrongPassword123*"
                })
                .expect(201)
        })

        beforeEach(async () => {
            const redisProvider = app.get(AuthRedisProvider)
            await redisProvider.client.flushAll()
        })

        it("should return new access token on refresh", async () => {
            const clientId = "test-client"
            const loginResponse = await request(app.getHttpServer())
                .post("/api/auth/login")
                .send({
                    email,
                    password,
                    clientId
                })
                .expect(200)

            const loginResponseBody = loginResponse.body as UserAuthResponse

            const refreshResponse = await request(app.getHttpServer())
                .post("/api/auth/refresh-token")
                .send({
                    refreshToken: loginResponseBody.refreshToken,
                    clientId
                })
                .expect(200)

            expect(refreshResponse.body).toHaveProperty("accessToken")
            expect(refreshResponse.body).toHaveProperty("refreshToken")
            expect((refreshResponse.body as { accessToken: string }).accessToken).not.toBe(
                loginResponseBody.accessToken
            )
        })

        it("should not allow to reuse access token after logout", async () => {
            const clientId = "test-client"
            const loginResponse = await request(app.getHttpServer())
                .post("/api/auth/login")
                .send({
                    email,
                    password,
                    clientId
                })
                .expect(200)

            const loginResponseBody = loginResponse.body as UserAuthResponse

            await request(app.getHttpServer())
                .post("/api/auth/logout")
                .set("Authorization", `Bearer ${loginResponseBody.accessToken}`)
                .send({
                    refreshToken: loginResponseBody.refreshToken,
                    clientId
                })
                .expect(204)

            await request(app.getHttpServer())
                .get("/api/auth/current-user")
                .set("Authorization", `Bearer ${loginResponseBody.accessToken}`)
                .expect(401)
        })

        it("should not allow reuse refresh token after logout", async () => {
            const clientId = "test-client"
            const loginResponse = await request(app.getHttpServer())
                .post("/api/auth/login")
                .send({
                    email,
                    password,
                    clientId
                })
                .expect(200)

            const loginResponseBody = loginResponse.body as UserAuthResponse

            await request(app.getHttpServer())
                .post("/api/auth/logout")
                .set("Authorization", `Bearer ${loginResponseBody.accessToken}`)
                .send({
                    refreshToken: loginResponseBody.refreshToken,
                    clientId
                })
                .expect(204)

            await request(app.getHttpServer())
                .post("/api/auth/refresh-token")
                .send({
                    refreshToken: loginResponseBody.refreshToken,
                    clientId
                })
                .expect(403)
        })

        it("should logout user from all clients when trying to use refresh token with invalid raw value part", async () => {
            const clientId = "test-client"
            const firstLoginResponse = await request(app.getHttpServer())
                .post("/api/auth/login")
                .send({
                    email,
                    password,
                    clientId
                })
                .expect(200)

            const firstLoginResponseBody = firstLoginResponse.body as UserAuthResponse

            const secondLoginResponse = await request(app.getHttpServer())
                .post("/api/auth/login")
                .send({
                    email,
                    password,
                    clientId: "another-client"
                })
                .expect(200)

            const secondLoginResponseBody = secondLoginResponse.body as UserAuthResponse

            // Try to refresh first login with malformed token
            await request(app.getHttpServer())
                .post("/api/auth/refresh-token")
                .send({
                    refreshToken: firstLoginResponseBody.refreshToken + "manipulated",
                    clientId
                })
                .expect(403)

            // Access token with second login should be revoked now
            await request(app.getHttpServer())
                .get("/api/auth/current-user")
                .set("Authorization", `Bearer ${secondLoginResponseBody.accessToken}`)
                .expect(401)
        })
    })
})
