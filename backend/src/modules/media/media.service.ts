import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { mkdir, writeFile, readFile, unlink } from 'fs/promises';
import { join, extname } from 'path';

export interface PresignedUploadResult {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export interface UploadResult {
  key: string;
  publicUrl: string;
}

/**
 * AWS S3 medya servisi — S3 yoksa yerel uploads/ klasörüne yazar.
 */
@Injectable()
export class MediaService {
  private readonly s3: S3Client | null;
  private readonly bucket: string;
  private readonly region: string;
  private readonly uploadsDir: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly config: ConfigService) {
    const aws = config.get('app.aws');

    this.bucket = aws.bucket;
    this.region = aws.region;
    this.uploadsDir = join(process.cwd(), 'uploads');
    this.publicBaseUrl = `${config.get<string>('app.publicApiUrl')}/media/files`;

    if (aws.accessKeyId && aws.secretAccessKey) {
      this.s3 = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: aws.accessKeyId,
          secretAccessKey: aws.secretAccessKey,
        },
      });
    } else {
      this.s3 = null;
    }
  }

  private buildKey(folder: string, filename: string): string {
    const ext = extname(filename) || '.bin';
    const safeExt = ext.replace(/[^.a-zA-Z0-9]/g, '') || '.bin';
    return `${folder}/${randomUUID()}${safeExt}`;
  }

  private s3PublicUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /** Yükleme için presigned PUT URL üretir (yalnızca S3) */
  async createPresignedUpload(
    filename: string,
    contentType: string,
    folder = 'uploads',
  ): Promise<PresignedUploadResult> {
    if (!this.s3) {
      throw new ServiceUnavailableException(
        'S3 yapılandırılmamış. /media/upload endpoint kullanın.',
      );
    }

    const key = this.buildKey(folder, filename);
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 600 });
    return { uploadUrl, key, publicUrl: this.s3PublicUrl(key) };
  }

  /** Dosyayı S3 veya yerel diske yükler */
  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    contentType: string,
    folder = 'uploads',
  ): Promise<UploadResult> {
    const key = this.buildKey(folder, filename);

    if (this.s3) {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }),
      );
      return { key, publicUrl: this.s3PublicUrl(key) };
    }

    const filePath = join(this.uploadsDir, key);
    await mkdir(join(this.uploadsDir, folder), { recursive: true });
    await writeFile(filePath, buffer);
    return { key, publicUrl: `${this.publicBaseUrl}/${key}` };
  }

  async readLocalFile(key: string): Promise<{ buffer: Buffer; contentType: string }> {
    const normalized = key.replace(/\.\./g, '');
    const filePath = join(this.uploadsDir, normalized);

    try {
      const buffer = await readFile(filePath);
      const ext = extname(normalized).toLowerCase();
      const types: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
      };
      return { buffer, contentType: types[ext] ?? 'application/octet-stream' };
    } catch {
      throw new NotFoundException('Dosya bulunamadı.');
    }
  }

  async deleteObject(key: string): Promise<void> {
    if (this.s3) {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return;
    }

    const filePath = join(this.uploadsDir, key.replace(/\.\./g, ''));
    try {
      await unlink(filePath);
    } catch {
      /* dosya zaten yok */
    }
  }
}
