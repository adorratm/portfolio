import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechStackItem } from '@modules/tech-stack/entities/tech-stack-item.entity';
import { TechStackService } from '@modules/tech-stack/tech-stack.service';
import { TechStackController } from '@modules/tech-stack/tech-stack.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TechStackItem])],
  controllers: [TechStackController],
  providers: [TechStackService],
  exports: [TechStackService],
})
export class TechStackModule {}
