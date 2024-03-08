import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Create a new logger instance
  const logger = new Logger('App');
  app.useWebSocketAdapter(new IoAdapter(app));

  // Specify the origin to allow cross-origin requests
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies and HTTP authentication
  });

  const port = 3001;
  await app.listen(port, () => {
    logger.log(`Server started on port ${port}`);
  });
}
bootstrap();
