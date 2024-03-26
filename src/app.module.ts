import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RequestService } from './app.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [RequestService],
})
export class AppModule {}
