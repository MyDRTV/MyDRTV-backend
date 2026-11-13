import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule } from './movies/movies.module';

@Module({
  // DataSource
  imports: [
    MoviesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // DataSource
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.getOrThrow<string>('DB_HOST'),
        port: Number(config.getOrThrow<string>('DB_PORT')),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD') ?? '',
        database: config.getOrThrow<string>('DB_DATABASE'),

        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
