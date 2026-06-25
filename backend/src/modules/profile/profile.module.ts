import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileContent } from '@modules/profile/entities/profile-content.entity';
import { ProfileService } from '@modules/profile/profile.service';
import { ProfileController } from '@modules/profile/profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileContent])],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
