import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from './category/category.module';
import { ConditionModule } from './condition/condition.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // אם ה-DB שלך רץ מקומית
      port: 5432, // ברירת המחדל של PostgreSQL
      username: 'postgres', // שנה לשם המשתמש שלך ב-PostgreSQL
      password: '0548119777', // שנה לסיסמה שלך
      database: 'switch_me', // שם ה-DB שלך
      autoLoadEntities: true, // טוען ישויות (Entities) אוטומטית
      synchronize: true, // יוצר טבלאות אוטומטית (לשלב פיתוח בלבד!)
    }),
    ConditionModule,
    CategoryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
