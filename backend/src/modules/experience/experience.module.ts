import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Experience } from '@modules/experience/entities/experience.entity';
import { ExperienceService } from '@modules/experience/experience.service';
import { ExperienceController } from '@modules/experience/experience.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Experience])],
  controllers: [ExperienceController],
  providers: [ExperienceService],
  exports: [ExperienceService],
})
export class ExperienceModule {}
