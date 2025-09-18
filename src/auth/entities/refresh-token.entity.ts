import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm"
import { User } from "@/users/entities/user.entity"

@Entity("refresh_tokens")
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    tokenHash: string

    @Column({ type: "varchar", length: 64 })
    clientId: string

    @ManyToOne(() => User, user => user.refreshTokens, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: User

    @Column()
    userId: number

    @Column({ type: "uuid" })
    familyId: string

    @Column({
        type: "bigint",
        nullable: true,
        default: null
    })
    replacedByTokenId: number | null = null

    @Column({
        type: "timestamptz",
        nullable: true,
        default: null
    })
    revokedAt: Date | null = null

    @Column({
        type: "timestamptz"
    })
    expiresAt: Date

    @Column({
        type: "timestamptz",
        default: () => "CURRENT_TIMESTAMP"
    })
    createdAt: Date

    isExpired(now: Date): boolean {
        return now >= this.expiresAt
    }

    isRevoked(): boolean {
        return this.revokedAt !== null
    }

    isActive(now: Date): boolean {
        return this.revokedAt === null && !this.isExpired(now)
    }
}
