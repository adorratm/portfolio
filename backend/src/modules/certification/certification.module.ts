import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certification } from '@modules/certification/entities/certification.entity';
import { CertificationService } from '@modules/certification/certification.service';
import { CertificationController } from '@modules/certification/certification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Certification])],
  controllers: [CertificationController],
  providers: [CertificationService],
  exports: [CertificationService],
})
export class CertificationModule {}
