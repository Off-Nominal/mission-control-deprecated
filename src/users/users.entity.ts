import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  discord_id: string;

  @Column()
  new_event: boolean;

  @Column()
  pre_notification: boolean;
}
