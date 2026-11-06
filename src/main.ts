import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Cấu hình thư mục tĩnh
  // Tự định nghĩa __dirname cho môi trường ESM
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Sau đó sử dụng bình thường để trỏ tới thư mục tĩnh
  const uploadPath = join(__dirname, '..', 'uploads');
  app.useStaticAssets(uploadPath, {
    prefix: '/uploads/', // Tiền tố URL để truy cập ảnh (ví dụ: localhost:3000/public/ten-anh.jpg)
  });

  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  await app.listen(port ?? 3000);

  Logger.log(`Application is running on: ${port}`);
}
await bootstrap();
