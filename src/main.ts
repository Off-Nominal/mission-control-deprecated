import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DiscordLoggerService } from "./discord-logger/discord-logger.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(DiscordLoggerService));
  await app.listen(3000);
}
bootstrap();
