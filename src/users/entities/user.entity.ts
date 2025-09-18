import {
    AfterInsert,
    Column,
    Entity,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToMany,
    JoinTable
} from "typeorm"
import { RefreshToken } from "@/auth/entities/refresh-token.entity"
import { CarReport } from "@/car-reports/entities/car-report.entity"
import { Role } from "./role.entity"

@Entity("users")
export class User {
    constructor(email: string, name: string, nickname?: string) {
        this.email = email
        this.name = name
        this.nickname = nickname || null
    }

    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true, type: "varchar", length: 255 })
    email: string

    @Column({ type: "varchar", length: 255 })
    name: string

    @Column({ type: "varchar", length: 255, nullable: true })
    nickname: string | null

    @Column()
    passwordHash: string

    @ManyToMany(() => Role, role => role.users, { eager: true })
    @JoinTable({ name: "user_roles" })
    roles: Role[]

    @Column({ type: "int", default: 0 })
    tokenVersion: number

    @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
    refreshTokens: RefreshToken[]

    @OneToMany(() => CarReport, report => report.creator)
    reports: CarReport[]

    @AfterInsert()
    logInsert() {
        console.log(`User inserted: ${this.email}`)
    }
}
