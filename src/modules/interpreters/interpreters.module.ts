import { Module } from '@nestjs/common';
import { InterpretersService } from './interpreters.service';
import { InterpretersController } from './interpreters.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InterpretersPublicService } from './interpreters-public.service';

@Module({
  imports: [PrismaModule],
  controllers: [InterpretersController],
  providers: [InterpretersService, InterpretersPublicService],
  exports: [InterpretersService, InterpretersPublicService],
})
export class InterpretersModule {}
