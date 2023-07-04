import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Ndb2MessageSubscription } from "./ndb2-message-subscriptions.entity";

@Injectable()
export class Ndb2MessageSubscriptionService {
  constructor(
    @InjectRepository(Ndb2MessageSubscription)
    private ndb2MsgSubService: Repository<Ndb2MessageSubscription>
  ) {}

  findAll(): Promise<Ndb2MessageSubscription[]> {
    return this.ndb2MsgSubService.find();
  }

  // findOne(id: number): Promise<User | null> {
  //   return this.usersRepository.findOneBy({ id });
  // }

  // async remove(id: number): Promise<void> {
  //   await this.usersRepository.delete(id);
  // }
}
