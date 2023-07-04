import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Ndb2MessageSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  prediction_id: number;

  @Column()
  type: string;

  @Column()
  channel_id: string;

  @Column()
  message_id: string;

  @Column()
  expiry: string;
}
