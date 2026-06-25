import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';
import { MediaService } from '@modules/media/media.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

class PresignDto {
  @IsString()
  filename!: string;

  @IsString()
  contentType!: string;

  @IsString()
  folder?: string;
}

class DeleteMediaDto {
  @IsString()
  key!: string;
}

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('presign')
  presign(@Body() dto: PresignDto) {
    return this.mediaService.createPresignedUpload(
      dto.filename,
      dto.contentType,
      dto.folder,
    );
  }

  @Delete()
  remove(@Body() dto: DeleteMediaDto) {
    return this.mediaService.deleteObject(dto.key);
  }
}
