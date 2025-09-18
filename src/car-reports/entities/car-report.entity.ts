import { User } from "@/users/entities/user.entity"
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity("car_reports")
export class CarReport {
    constructor(
        creatorId: number,
        price: number,
        make: string,
        model: string,
        year: number,
        longitude: number,
        latitude: number,
        mileage: number
    ) {
        this.creatorId = creatorId
        this.price = price
        this.make = make
        this.model = model
        this.year = year
        this.longitude = longitude
        this.latitude = latitude
        this.mileage = mileage
    }

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    creatorId: number

    @ManyToOne(() => User, user => user.reports, { eager: true })
    @JoinColumn({ name: "creatorId" })
    creator: User

    @Column({ type: "decimal", precision: 14, scale: 4 })
    price: number

    @Column({ type: "varchar", length: 100 })
    make: string

    @Column({ type: "varchar", length: 100 })
    model: string

    @Column("int")
    year: number

    @Column("float")
    longitude: number

    @Column("float")
    latitude: number

    @Column("int")
    mileage: number

    @Column({ default: false })
    approved: boolean

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP"
    })
    createdAt: Date
}
