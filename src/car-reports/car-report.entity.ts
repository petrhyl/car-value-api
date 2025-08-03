import { User } from "@/users/user.entity"
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

    @Column()
    price: number

    @Column()
    make: string

    @Column()
    model: string

    @Column()
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
