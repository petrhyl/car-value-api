import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ValidationPipe } from "@nestjs/common"
import { NestExpressApplication } from "@nestjs/platform-express"

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true
        })
    )
    app.disable("x-powered-by")
    app.setGlobalPrefix("api")
    app.set("query parser", "extended")
    app.enableShutdownHooks()

    await app.listen(process.env.APP_PORT || 5001)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap()
