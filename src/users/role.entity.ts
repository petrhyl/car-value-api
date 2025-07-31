import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm"
import { User } from "./user.entity"

@Entity("roles")
export class Role {
    constructor(name: RoleName) {
        this.name = name
    }

    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    name: string

    @Column({ type: "varchar" })
    description: string

    @ManyToMany(() => User, user => user.roles)
    users: User[]
}

export enum RoleName {
    USER = "user",
    ADMIN = "admin",
    MODERATOR = "moderator"
}
