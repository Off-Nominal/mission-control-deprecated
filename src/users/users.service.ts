import { Global, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./users.entity";
import { ManagedEvent } from "src/events-manager/events-manager.types";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async setEventSubscriptions(
    discord_id: string,
    newEvent: undefined | boolean | null,
    preEvent: undefined | number | null
  ): Promise<User> {
    const subscribeSet = newEvent !== undefined;
    const preEventSet = preEvent !== undefined;

    const insertValues: Partial<User> = {
      discord_id,
    };
    const conflictArray: string[] = [];

    if (subscribeSet) {
      insertValues.new_event = newEvent || false;
      conflictArray.push("new_event");
    }

    if (preEventSet) {
      insertValues.pre_notification = preEvent || null;
      conflictArray.push("pre_notification");
    }

    const user = await this.usersRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(insertValues)
      .orUpdate(conflictArray, ["discord_id"])
      .returning(["id", "discord_id", "new_event", "pre_notification"])
      .execute();

    return user.raw[0];
  }

  async getSubscribersByType(type: ManagedEvent): Promise<User[]> {
    const col =
      type === ManagedEvent.NEW
        ? "new_event = true"
        : "pre_notification = true";
    const subscribers = await this.usersRepository
      .createQueryBuilder()
      .where(col)
      .getMany();

    return subscribers;
  }
}
