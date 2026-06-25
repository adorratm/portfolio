import { Module } from '@nestjs/common';
import { MediaService } from '@modules/media/media.service';
import { MediaController } from '@modules/media/media.controller';

@Module({
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
