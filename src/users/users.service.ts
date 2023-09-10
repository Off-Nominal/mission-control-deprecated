import { Global, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Users } from "./users.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>
  ) {}

  async setEventSubscriptions(
    discord_id: string,
    newEvent: undefined | boolean | null,
    preEvent: undefined | number | null
  ): Promise<Users> {
    const subscribeSet = newEvent !== undefined;
    const preEventSet = preEvent !== undefined;

    const insertValues: Partial<Users> = {
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
      .into(Users)
      .values(insertValues)
      .orUpdate(conflictArray, ["discord_id"])
      .returning(["id", "discord_id", "new_event", "pre_notification"])
      .execute();

    return user.raw[0];
  }
}
