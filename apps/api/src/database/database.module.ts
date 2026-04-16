import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { fileURLToPath } from 'url';
import * as path from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './db.sqlite',
      entities: [path.join(path.dirname(fileURLToPath(import.meta.url)), '/../**/*.entity{.ts,.js}')],
      synchronize: true, // This should be false in production
    }),
  ],
})
export class DatabaseModule {}
