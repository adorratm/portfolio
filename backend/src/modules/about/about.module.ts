import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutContent } from '@modules/about/entities/about-content.entity';
import { AboutService } from '@modules/about/about.service';
import { AboutController } from '@modules/about/about.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AboutContent])],
  controllers: [AboutController],
  providers: [AboutService],
  exports: [AboutService],
})
export class AboutModule {}
