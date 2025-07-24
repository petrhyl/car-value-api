import { CallHandler, ExecutionContext, NestInterceptor, UseInterceptors } from "@nestjs/common"
import { ClassConstructor, plainToClass } from "class-transformer"
import { map, Observable } from "rxjs"

export function Serialize<T>(dto: ClassConstructor<T>) {
    return UseInterceptors(new SerializeInterceptor(dto))
}

export class SerializeInterceptor<T> implements NestInterceptor {
    constructor(private readonly dto: ClassConstructor<T>) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        // Run before a request is handled

        return next.handle().pipe(
            map(data => {
                // Run before the response is sent

                return plainToClass(this.dto, data, { excludeExtraneousValues: true })
            })
        )
    }
}
