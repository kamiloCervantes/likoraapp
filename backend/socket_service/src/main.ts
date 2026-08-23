import { NestFactory } from '@nestjs/core';
import { SocketModule } from './socket.module';
import { RedisIoAdapter } from './adapters/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(SocketModule);
  
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const port = process.env.SOCKET_PORT || 3001;
  await app.listen(port);
  console.log(`[Likora Socket Service] Gateway corriendo en el puerto ${port}`);
}
bootstrap();
