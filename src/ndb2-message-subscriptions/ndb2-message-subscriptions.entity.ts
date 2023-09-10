import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: "ndb2_message_subscriptions",
})
export class Ndb2MessageSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("integer")
  prediction_id: number;

  @Column("varchar")
  type: string;

  @Column("varchar")
  channel_id: string;

  @Column("varchar", { nullable: true })
  message_id: string;

  @Column("timestamp without time zone")
  expiry: string;
}
