import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    // ✅ הוספת תמיכה ב-CORS
    app.enableCors({
      origin: 'http://localhost:4200', // מאפשר קריאות מה-Frontend
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true, // אם יש צורך באימות (כגון JWT)
    });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
