import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsOptional, IsString } from 'class-validator';
import type { Response } from 'express';
import { MediaService } from '@modules/media/media.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

class PresignDto {
  @IsString()
  filename!: string;

  @IsString()
  contentType!: string;

  @IsOptional()
  @IsString()
  folder?: string;
}

class DeleteMediaDto {
  @IsString()
  key!: string;
}

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('presign')
  @UseGuards(JwtAuthGuard)
  presign(@Body() dto: PresignDto) {
    return this.mediaService.createPresignedUpload(
      dto.filename,
      dto.contentType,
      dto.folder,
    );
  }

  /** Multipart yükleme — S3 veya yerel disk */
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async upload(
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string } | undefined,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      return { error: 'Dosya gerekli.' };
    }
    return this.mediaService.uploadBuffer(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder ?? 'uploads',
    );
  }

  /** Yerel dosya servisi (S3 yapılandırılmadığında) */
  @Get('files/:folder/:name')
  async serveFile(
    @Param('folder') folder: string,
    @Param('name') name: string,
    @Res() res: Response,
  ) {
    const key = `${folder}/${name}`;
    const { buffer, contentType } = await this.mediaService.readLocalFile(key);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(buffer);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  remove(@Body() dto: DeleteMediaDto) {
    return this.mediaService.deleteObject(dto.key);
  }
}
