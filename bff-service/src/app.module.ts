import { Module } from '@nestjs/common';
import { ApiController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule],
  controllers: [ApiController],
})
export class AppModule {}
