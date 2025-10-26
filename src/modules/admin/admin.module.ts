import { Module } from '@nestjs/common';
import { AdminInterpretersController } from './controllers/admin-interpreters.controller';
import { AdminInterpretersService } from './services/admin-interpreters.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminInterpretersController],
  providers: [AdminInterpretersService],
})
export class AdminModule {}
