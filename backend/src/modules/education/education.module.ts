import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationItem } from '@modules/education/entities/education-item.entity';
import { EducationService } from '@modules/education/education.service';
import { EducationController } from '@modules/education/education.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EducationItem])],
  controllers: [EducationController],
  providers: [EducationService],
  exports: [EducationService],
})
export class EducationModule {}
