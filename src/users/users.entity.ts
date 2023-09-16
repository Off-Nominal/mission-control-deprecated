import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: "users",
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { unique: true })
  discord_id: string;

  @Column("boolean", { default: false })
  new_event: boolean;

  @Column("integer", { nullable: true })
  pre_notification: number;
}
