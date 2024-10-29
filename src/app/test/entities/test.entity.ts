import { UUIDEntity } from "@/utils";
import { Column, Entity } from "typeorm";

@Entity()
export class Test extends UUIDEntity {
    @Column()
    name : string
}
