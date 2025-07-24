import { AfterInsert, Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm"
import { RefreshToken } from "../auth/refresh-token.entity"

@Entity()
export class User {
    constructor(email: string, name: string, nickname?: string) {
        this.email = email
        this.name = name
        this.nickname = nickname || null
    }

    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    email: string

    @Column()
    name: string

    @Column({ type: "varchar", nullable: true })
    nickname: string | null

    @Column()
    passwordHash: string

    @Column({ type: "int", default: 1 })
    tokenVersion: number

    @AfterInsert()
    logInsert() {
        console.log(`User inserted: ${this.email}`)
    }

    @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
    refreshTokens: RefreshToken[]
}
