import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm"
import { User } from "../users/user.entity"

@Entity("refresh_tokens")
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    tokenHash: string

    @Column()
    clientId: string

    @ManyToOne(() => User, user => user.refreshTokens, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: User

    @Column()
    userId: number

    @Column({
        type: process.env.DB_TYPE === "postgres" ? "timestamptz" : "datetime",
        default: () => "CURRENT_TIMESTAMP"
    })
    createdAt: Date
}
