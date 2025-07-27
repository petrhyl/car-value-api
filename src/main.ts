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

    await app.listen(process.env.PORT ?? 3000)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap()
