import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('KhudaMukti API')
    .setDescription('Surplus food rescue and delivery REST API')
    .setVersion('1.0')
    .addBearerAuth();

  const document = SwaggerModule.createDocument(app, config.build());
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`KhudaMukti API listening on http://localhost:${port}`);
}
bootstrap();
