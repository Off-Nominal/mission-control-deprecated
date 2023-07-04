import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Ndb2MessageSubscription } from "./ndb2-message-subscriptions.entity";
import { Ndb2MessageSubscriptionService } from "./ndb2-message-subscriptions.service";

@Module({
  imports: [TypeOrmModule.forFeature([Ndb2MessageSubscription])],
  providers: [Ndb2MessageSubscriptionService],
})
export class Ndb2MessageSubscriptionModule {}
