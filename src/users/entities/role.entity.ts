import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm"
import { User } from "./user.entity"

@Entity("roles")
export class Role {
    constructor(name: RoleName) {
        this.name = name
    }

    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true, type: "varchar", length: 50 })
    name: RoleName

    @Column({ type: "varchar", length: 255 })
    description: string

    @ManyToMany(() => User, user => user.roles)
    users: User[]
}

export enum RoleName {
    USER = "user",
    ADMIN = "admin",
    MODERATOR = "moderator"
}
