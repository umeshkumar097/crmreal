import { Module } from '@nestjs/common';
import { BuildersController } from './builders.controller';
import { BuildersService } from './builders.service';
import { PrismaModule } from '../../infrastructure/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BuildersController],
  providers: [BuildersService],
  exports: [BuildersService],
})
export class BuildersModule {}
